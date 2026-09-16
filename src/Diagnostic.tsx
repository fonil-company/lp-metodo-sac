import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCheck, Clock3, Download, LockKeyhole, RotateCcw, ShieldCheck, LoaderCircle } from 'lucide-react';
import { steps, type Question } from './diagnostic-data';
import { STORAGE_KEY, formatPhone, validateContact, normalizePhone, sanitizeAnswers, attributionFrom, leadWebhookPayload, submitLead } from './lib/diagnostic.mjs';
import { track } from './lib/tracking';

type Answers = Record<string, string>;
type Contact = { name: string; company: string; phone: string; email: string; city: string; state: string };
const emptyContact: Contact = { name: '', company: '', phone: '', email: '', city: '', state: '' };
const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const endpoint = '/api/leads';
const privacyUrl = import.meta.env.VITE_PRIVACY_URL?.trim();
const live = Boolean(endpoint);
const contactStep = steps.length;
const totalSteps = contactStep + 1;
function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return null;
    return {
      step: Number.isInteger(saved.step) ? Math.max(0, Math.min(contactStep, saved.step)) : 0,
      answers: sanitizeAnswers(Object.fromEntries(Object.entries(saved.answers || {}).filter(([, value]) => typeof value === 'string'))) as Answers,
      contact: Object.fromEntries(Object.keys(emptyContact).map(key => [key, typeof saved.contact?.[key] === 'string' ? saved.contact[key] : ''])) as Contact,
    };
  } catch { return null; }
}
const restored = restore();
export default function Diagnostic() {
  const [step, setStep] = useState(restored?.step || 0);
  const [answers, setAnswers] = useState<Answers>(restored?.answers || {});
  const [contact, setContact] = useState<Contact>(restored?.contact || emptyContact);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [saveIssue, setSaveIssue] = useState(false);
  const [submission, setSubmission] = useState<Record<string, unknown> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const milestones = useRef(new Set<number>());
  const eventId = useRef(crypto.randomUUID());
  const attribution = useRef(attributionFrom(window.location.search));
  const questionStep = steps[Math.min(step, contactStep - 1)];
  const progress = Math.round((step / totalSteps) * 100);

  useEffect(() => {
    if (done) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers, contact })); }
    catch { setSaveIssue(true); }
  }, [step, answers, contact, done]);
  useEffect(() => {
    if (interacted.current) heading.current?.focus({ preventScroll: true });
  }, [step, done]);

  function updateAnswer(id: string, value: string) {
    if (!interacted.current) { interacted.current = true; track('diagnostic_start'); }
    setAnswers(previous => sanitizeAnswers({ ...previous, [id]: value }));
    setErrors(previous => { const next = { ...previous }; delete next[id]; return next; });
  }
  function goTo(next: number) {
    setStep(next); setErrors({});
    for (const milestone of [25, 50, 75]) {
      if ((next / totalSteps) * 100 >= milestone && !milestones.current.has(milestone)) {
        track('diagnostic_step_' + milestone); milestones.current.add(milestone);
      }
    }
    const top = document.getElementById('diagnostic-panel')!.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function next() {
    const validation: Record<string, string> = {};
    questionStep.questions.forEach(question => {
      if (!question.optional && !answers[question.id]?.trim()) validation[question.id] = 'Responda esta pergunta para continuar.';
    });
    setErrors(validation);
    if (!Object.keys(validation).length) goTo(step + 1);
    else requestAnimationFrame(() => document.querySelector<HTMLElement>('#diagnostic-panel [aria-invalid="true"]')?.focus());
  }
  function download(payload: Record<string, unknown>) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'diagnostico-sac.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function finish(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const validation = validateContact(contact) as Record<string, string>;
    if (live && !consent) validation.consent = 'Autorize o contato para enviar o diagnóstico.';
    setErrors(validation);
    if (Object.keys(validation).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('#diagnostic-panel [aria-invalid="true"]')?.focus());
      return;
    }
    const payload = {
      schema_version: 1, event_id: eventId.current, created_at: new Date().toISOString(),
      answers: sanitizeAnswers(answers),
      contact: { ...contact, name: contact.name.trim(), company: contact.company.trim(), email: contact.email.trim(), city: contact.city.trim(), phone: normalizePhone(contact.phone) },
      attribution: attribution.current,
      consent: { contact: live && consent, privacy_url: live ? privacyUrl : null, timestamp: new Date().toISOString() },
      source: 'metodo-sac-landing-page'
    };
    setBusy(true);
    try {
      if (live) {
        await submitLead(endpoint, leadWebhookPayload(payload.contact));
        track('diagnostic_submit', { event_id: payload.event_id, profile: answers.profile, segment: answers.segment, revenue: answers.revenue, representatives: answers.representatives, authority: answers.authority });
      }
      setSubmission(payload); setDone(true);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Browser storage may be unavailable. */ }
    } catch (error) { setErrors({ submit: error instanceof Error ? error.message : 'Não foi possível enviar. Tente novamente.' }); }
    finally { setBusy(false); }
  }
  function renderQuestion(question: Question) {
    const invalid = Boolean(errors[question.id]);
    return <fieldset key={question.id} className="question-group">
      <legend>{question.label}</legend>
      {question.options ? question.options.length > 8 ?
        <select aria-label={question.label} id={question.id} value={answers[question.id] || ''} onChange={event => updateAnswer(question.id, event.target.value)} aria-invalid={invalid} aria-describedby={invalid ? question.id + '-error' : undefined}>
          <option value="">Selecione uma opção</option>{question.options.map(option => <option key={option}>{option}</option>)}
        </select> :
        <div className={'options-grid ' + (question.options.some(option => option.length > 42) ? 'long-options' : '')}>
          {question.options.map(option => <label className={'option ' + (answers[question.id] === option ? 'selected' : '')} key={option}>
            <input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => updateAnswer(question.id, option)} aria-invalid={invalid} aria-describedby={invalid ? question.id + '-error' : undefined} />
            <span className="radio-mark">{answers[question.id] === option && <Check size={11} />}</span><span>{option}</span>
          </label>)}
        </div> :
        <textarea aria-label={question.label} placeholder={question.placeholder} value={answers[question.id] || ''} onChange={event => updateAnswer(question.id, event.target.value)} maxLength={600} rows={3} aria-invalid={invalid} aria-describedby={invalid ? question.id + '-error' : undefined} />}
      {invalid && <p className="field-error" id={question.id + '-error'} role="alert">{errors[question.id]}</p>}
    </fieldset>;
  }

  return <section id="diagnostico-sac" className="section diagnostic-section">
    <div className="container diagnostic-layout">
      <div className="diagnostic-intro reveal">
        <span className="eyebrow"><span className="tiny-square" />DIAGNÓSTICO DE EXPANSÃO COMERCIAL</span>
        <h2>Seu próximo estágio<br />de crescimento<br /> começa com <em>clareza.</em></h2>
        <p>Descubra o que hoje está limitando a entrada de novos clientes na sua operação.</p>
        <p className="muted">Responda algumas perguntas sobre sua indústria ou distribuidora. Nossa equipe poderá analisar seus gargalos e o potencial de expansão comercial.</p>
        <div className="diagnostic-benefits">
          <div><span>01</span><p>Entenda o momento da sua operação</p></div>
          <div><span>02</span><p>Identifique os gargalos de aquisição</p></div>
          <div><span>03</span><p>Encontre os próximos passos</p></div>
        </div>
        <div className="time-note"><Clock3 size={16} /><span>2 a 4 minutos</span><span className="note-divider" /><span>Sem compromisso</span></div>
        <div className="diagnostic-decoration" aria-hidden="true"><div /><div /><div /><span>S.A.C / DIAGNÓSTICO</span></div>
      </div>
      <div id="diagnostic-panel" className="diagnostic-panel">
        <div className="form-topline"><span><span className="status-dot" />DIAGNÓSTICO SAC</span><span>{done ? 'CONCLUÍDO' : String(step + 1).padStart(2, '0') + ' / ' + String(totalSteps).padStart(2, '0')}</span></div>
        <div className="progress-track" role="progressbar" aria-label="Progresso do diagnóstico" aria-valuemin={0} aria-valuemax={100} aria-valuenow={done ? 100 : progress}><span style={{ width: (done ? 100 : progress) + '%' }} /></div>
        {done ? <div className="completion" role="status">
          <div className="completion-icon"><CheckCheck size={32} /></div>
          <span className="eyebrow">{live ? 'PRÓXIMO PASSO: ANÁLISE DA OPERAÇÃO' : 'DIAGNÓSTICO CONCLUÍDO NESTE DISPOSITIVO'}</span>
          <h3 ref={heading} tabIndex={-1}>{live ? 'Diagnóstico recebido.' : 'Suas respostas estão prontas.'}</h3>
          <p>{live ? 'Nossa equipe agora vai analisar as informações da sua operação. Caso exista aderência, você receberá um contato pelo WhatsApp informado.' : 'O envio para a equipe ainda não está disponível. Baixe uma cópia do diagnóstico para guardar suas respostas. Nenhum dado foi enviado.'}</p>
          <div className="review-topics">{['Estrutura comercial', 'Aquisição e representantes', 'Potencial de expansão', 'Momento de implementação'].map(item => <span key={item}><Check size={14} />{item}</span>)}</div>
          {!live && <button className="button button-primary" onClick={() => submission && download(submission)}><Download size={17} />Baixar minhas respostas</button>}
          <p className="fine-print">A recomendação do Método SAC depende do estágio atual da operação, região, estrutura comercial e objetivo de expansão.</p>
          <button className="text-button" onClick={() => { setDone(false); setSubmission(null); setAnswers({}); setContact(emptyContact); setStep(0); setConsent(false); eventId.current = crypto.randomUUID(); milestones.current.clear(); interacted.current = false; }}><RotateCcw size={14} />Iniciar novo diagnóstico</button>
        </div> : <form noValidate onSubmit={step === contactStep ? finish : event => { event.preventDefault(); next(); }}>
          <div className="form-body" key={step}>
            <span className="step-caption">ETAPA {step + 1} DE {totalSteps} · {step === contactStep ? 'SEUS DADOS' : 'SUA OPERAÇÃO'}</span>
            <h3 ref={heading} tabIndex={-1}>{step === contactStep ? 'Estamos quase terminando seu Diagnóstico SAC.' : questionStep.title}</h3>
            <p className="form-subtitle">{step === contactStep ? 'Preencha seus dados para acompanhar suas respostas e os próximos passos.' : questionStep.subtitle}</p>
            {step < contactStep ? <>
              {questionStep.questions.map(renderQuestion)}
            </> : <>
              {!live && <p className="preview-notice"><ShieldCheck size={18} />Versão de apresentação: seus dados ficam apenas nesta sessão. Ao concluir, você poderá baixar suas respostas.</p>}
              <div className="contact-grid">
                {([{ id: 'name', label: 'Nome completo', placeholder: 'Seu nome e sobrenome', auto: 'name' }, { id: 'company', label: 'Empresa', placeholder: 'Nome da sua empresa', auto: 'organization' }, { id: 'phone', label: 'WhatsApp', placeholder: '+55 (11) 99999-9999', auto: 'tel', type: 'tel' }, { id: 'email', label: 'E-mail corporativo', placeholder: 'voce@empresa.com.br', auto: 'email', type: 'email' }, { id: 'city', label: 'Cidade da sede', placeholder: 'Sua cidade', auto: 'address-level2' }] as const).map(field => <label key={field.id} className={'contact-field ' + (field.id === 'name' || field.id === 'company' ? 'full-field' : '')}>
                  <span>{field.label}</span><input aria-label={field.label} name={field.id} autoComplete={field.auto} type={'type' in field ? field.type : 'text'} placeholder={field.placeholder} value={contact[field.id]} maxLength={field.id === 'phone' ? 25 : 150} onChange={event => { setContact(previous => ({ ...previous, [field.id]: field.id === 'phone' ? formatPhone(event.target.value) : event.target.value })); setErrors(previous => ({ ...previous, [field.id]: '' })); }} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? field.id + '-error' : undefined} />
                  {errors[field.id] && <span className="field-error" id={field.id + '-error'} role="alert">{errors[field.id]}</span>}
                </label>)}
                <label className="contact-field"><span>Estado</span><select aria-label="Estado" name="state" autoComplete="address-level1" value={contact.state} onChange={event => { setContact(previous => ({ ...previous, state: event.target.value })); setErrors(previous => ({ ...previous, state: '' })); }} aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? 'state-error' : undefined}><option value="">Selecione</option>{states.map(state => <option key={state}>{state}</option>)}</select>{errors.state && <span className="field-error" id="state-error" role="alert">{errors.state}</span>}</label>
              </div>
              {live && <label className="consent-field"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} aria-invalid={Boolean(errors.consent)} /><span>Autorizo o uso dos dados para análise da operação e contato pela equipe{privacyUrl ? <>, conforme a <a href={privacyUrl} target="_blank" rel="noreferrer">Política de Privacidade</a></> : '.'}</span></label>}
              {errors.consent && <p role="alert" className="field-error">{errors.consent}</p>}
              {errors.submit && <p role="alert" className="field-error submit-error">{errors.submit}</p>}
            </>}
          </div>
          <div className="form-actions">
            {step > 0 ? <button className="text-button" type="button" onClick={() => goTo(step - 1)} disabled={busy}><ArrowLeft size={16} />Voltar</button> : <span className="form-security"><LockKeyhole size={13} />Seus dados protegidos</span>}
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} />Enviando...</> : <>{step === contactStep ? (live ? 'Finalizar meu diagnóstico SAC' : 'Concluir meu diagnóstico') : 'Continuar'}<ArrowRight size={17} /></>}</button>
          </div>
          <div className="form-footnote">{saveIssue ? 'O navegador não permitiu salvar o progresso. Mantenha esta página aberta.' : <><ShieldCheck size={13} />Seu progresso é salvo durante esta sessão.</>}</div>
        </form>}
      </div>
    </div>
  </section>;
}
