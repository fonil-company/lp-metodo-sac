import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, Building2, Check, CircleDot, Crosshair, Factory, Globe2, Layers3, Menu, Network, PackageCheck, Plus, Radar, Route, Settings2, ShieldCheck, Target, TrendingUp, Users, Workflow, X, Zap } from 'lucide-react';
import Diagnostic from './Diagnostic';
import sacLogo from './Logo sac.png';
import { consentKey, readConsent, track } from './lib/tracking';

function OfficialLogo() {
  return <span className="official-logo"><img src={sacLogo} width={1000} height={1000} alt="Método SAC — Sistema de Aquisição de Clientes" decoding="async" /></span>;
}
function Brand({ small = false }: { small?: boolean }) {
  return <a href="#inicio" className={'brand ' + (small ? 'brand-small' : '')} aria-label="Método SAC, início"><OfficialLogo /></a>;
}
function CTA({ children = 'Iniciar diagnóstico SAC', source = 'mid', outline = false, className = '' }: { children?: ReactNode; source?: string; outline?: boolean; className?: string }) {
  return <a href="#diagnostico-sac" onClick={() => track(source + '_cta_click')} className={'button ' + (outline ? 'button-outline' : 'button-primary') + ' ' + className}>{children}<ArrowUpRight size={18} /></a>;
}
function Label({ children }: { children: ReactNode }) { return <span className="eyebrow"><span className="tiny-square" />{children}</span>; }
const engines = [
  { label: 'Aquisição', icon: Target, description: 'Novas empresas no radar', detail: 'Campanhas e canais conectam sua operação a compradores B2B compatíveis.' },
  { label: 'Qualificação', icon: Settings2, description: 'Perfil certo. Oportunidade real.', detail: 'Critérios de perfil, região e momento ajudam a priorizar oportunidades.' },
  { label: 'Processo comercial', icon: Workflow, description: 'Cada contato, um próximo passo', detail: 'Pipeline, responsáveis e acompanhamento conectam interesse à venda.' },
  { label: 'Inteligência e escala', icon: BarChart3, description: 'Dados que orientam a expansão', detail: 'A operação identifica onde investir, o que melhorar e como expandir.' }
];
function SystemVisual() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(() => setActive(previous => (previous + 1) % engines.length), 3600);
    return () => clearInterval(interval);
  }, [paused]);
  const ActiveIcon = engines[active].icon;
  return <div className="system-visual" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className="visual-grid" aria-hidden="true" /><div className="visual-corner top-left" /><div className="visual-corner bottom-right" />
    <div className="visual-label"><span className="status-dot" />ECOSSISTEMA DE EXPANSÃO<span>01 — 04</span></div>
    <div className="orbital-art" aria-hidden="true">
      <div className="orbit orbit-outer"><span /></div><div className="orbit orbit-middle" /><div className="orbit orbit-inner" />
      <svg className="orbital-lines" viewBox="0 0 460 350"><path d="M230 65V145M230 205V290M100 175H200M260 175H365" stroke="#a8f600" strokeOpacity=".35" strokeDasharray="3 5" /></svg>
      <div className="satellite satellite-top"><Target size={17} /><span>AQUISIÇÃO</span></div><div className="satellite satellite-left"><Users size={17} /><span>COMERCIAL</span></div><div className="satellite satellite-right"><Network size={17} /><span>TECNOLOGIA</span></div><div className="satellite satellite-bottom"><TrendingUp size={17} /><span>EXPANSÃO</span></div>
      <div className="system-core"><OfficialLogo /><span>UM ÚNICO MÉTODO</span></div>
      <div className="orbit-particle particle-one" /><div className="orbit-particle particle-two" />
    </div>
    <div className="system-module" aria-live="off"><div className="module-icon"><ActiveIcon size={21} /></div><div><span>CAMADA {String(active + 1).padStart(2, '0')}</span><strong>{engines[active].description}</strong></div><ArrowUpRight size={20} /></div>
    <div className="system-tabs" aria-label="Explore as camadas do método">{engines.map((item, index) => <button key={item.label} className={active === index ? 'active' : ''} aria-pressed={active === index} aria-label={item.label} title={item.label} onClick={() => setActive(index)}><span>0{index + 1}</span><i /></button>)}</div>
    <div className="visual-footer"><span>AQUISIÇÃO → PIPELINE → EXPANSÃO</span><span>ESTRUTURA DO MÉTODO</span></div>
  </div>;
}
const pains = [
  ['A carteira cresce. A prospecção diminui.', 'Cada mês sem novas contas aumenta a dependência de quem já compra. Qualquer perda relevante passa a ter um impacto maior.'],
  ['Cada região depende de uma pessoa.', 'Uma região prospecta. Outra não. Uma cresce. Outra fica estagnada. E a gestão perde capacidade de conduzir a expansão.'],
  ['Mais representantes. O mesmo modelo.', 'Contratar pode aliviar o problema, mas a próxima carteira continua dependendo da iniciativa individual de cada profissional.'],
  ['Você vê o resultado. Mas vê o caminho?', 'Faturamento conta o que aconteceu. O pipeline precisa mostrar quais novas contas estão sendo construídas para os próximos meses.']
];
const comparisons = [
  ['O representante encontra praticamente todas as oportunidades', 'Existe um motor complementar de aquisição'],
  ['A prospecção diminui conforme a carteira aumenta', 'Novas oportunidades entram continuamente'],
  ['Cada região funciona de um jeito', 'Regiões e mercados recebem estratégias específicas'],
  ['Contatos espalhados em WhatsApp, planilhas e memória', 'Cada lead possui registro, responsável e próximo passo'],
  ['Problemas aparecem primeiro no faturamento', 'A liderança acompanha indicadores antes do resultado'],
  ['Expansão depende de contratação e iniciativa individual', 'Marketing e vendas dentro da mesma estratégia'],
  ['Marketing sem conexão com a operação', 'A expansão passa a seguir um processo']
];
const timeline = [
  ['Diagnóstico da operação', 'Entendemos sua estrutura, carteira, representantes, regiões, ferramentas e capacidade de atendimento.', 'ENTENDER'],
  ['Mapa SAC de Expansão', 'Definimos públicos, mercados, oferta, canais, responsabilidades e indicadores prioritários.', 'PLANEJAR'],
  ['Instalação da estrutura', 'Conectamos campanhas, páginas, CRM, pipeline, WhatsApp, automações e acompanhamento comercial.', 'CONECTAR'],
  ['Aquisição em produção', 'Novas oportunidades começam a entrar e seguir uma jornada comercial estruturada.', 'ATIVAR'],
  ['Dados orientam a expansão', 'Analisamos quais regiões convertem, onde as oportunidades avançam e onde escalar o investimento.', 'EXPANDIR']
];
const capabilities = [
  [Target, 'Estratégia de aquisição B2B', 'Segmentos, regiões, compradores, mensagem e canais de geração de demanda.', true],
  [Layers3, 'Campanhas e criativos', 'Produção e gestão dos ativos que levam novos compradores à sua operação.', true],
  [Workflow, 'Infraestrutura comercial', 'CRM, pipeline e processo para organizar cada oportunidade.', true],
  [Zap, 'Automação e integrações', 'WhatsApp, distribuição, lembretes e cadências com menos tarefas manuais.', true],
  [BarChart3, 'Inteligência comercial', 'Indicadores para acompanhar aquisição, avanço e conversão.', false],
  [Route, 'Acompanhamento da operação', 'Análise contínua de gargalos e oportunidades de melhoria.', false]
] as const;
const faqs = [
  ['O Método SAC substitui meus representantes?', 'Não. O SAC foi desenvolvido para complementar a estrutura comercial existente. O objetivo é reduzir a dependência do representante como único responsável pela prospecção de novos clientes.'],
  ['O Método SAC é uma agência de tráfego?', 'Não. Mídia paga pode fazer parte da aquisição, mas é apenas um componente. O método integra geração de demanda, processo comercial, acompanhamento, tecnologia e inteligência.'],
  ['Preciso trocar meu CRM?', 'Não necessariamente. Primeiro analisamos a estrutura existente. Se seu CRM atende corretamente à operação, ele pode ser mantido.'],
  ['Preciso ter representantes?', 'Não necessariamente. Mas o método foi pensado para empresas B2B com estrutura comercial e atuação no canal indireto.'],
  ['Vocês geram os leads ou somente estruturam o processo?', 'Dependendo do escopo, o Método SAC atua desde a geração da oportunidade até a organização e acompanhamento comercial.'],
  ['Quem atende as oportunidades?', 'Os leads podem ser direcionados para representantes, equipe interna, pré-vendas ou outra configuração adequada à operação.'],
  ['O diagnóstico é uma reunião de vendas?', 'O primeiro passo é entender sua operação. Caso exista aderência, nossa equipe pode apresentar uma proposta de implementação.'],
  ['Existe garantia de número de vendas?', 'Não. O resultado depende de produto, preço, mercado, equipe, atendimento e execução. O método foi desenvolvido para aumentar estrutura, visibilidade e capacidade de aquisição e acompanhamento.']
];
function LegalDialog({ kind, close }: { kind: string; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="legal-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <button onClick={close} className="icon-button dialog-close" aria-label="Fechar"><X size={20} /></button><Label>INFORMAÇÕES DO SITE</Label>
    <h2>{kind === 'privacy' ? 'Privacidade nesta versão' : 'Sobre esta apresentação'}</h2>
    {kind === 'privacy' ? <><p>As respostas são mantidas na sessão deste navegador para permitir continuar o diagnóstico. Sem integração ativa, nenhum diagnóstico é enviado à equipe.</p><p>Ao concluir a versão de apresentação, você pode baixar suas respostas. Ao encerrar a sessão do navegador, os dados temporários são removidos. A preferência de analytics é armazenada localmente.</p><p>Métricas opcionais só são habilitadas após sua autorização. Fontes do Google Fonts podem gerar solicitações ao provedor.</p><p>A política definitiva, com identificação do controlador e canal de atendimento, deverá ser disponibilizada pela operação antes da captação de dados.</p></> : <><p>Esta página apresenta o Método SAC e seu diagnóstico de expansão comercial. O diagnóstico não constitui proposta, contrato ou garantia de resultado.</p><p>Escopo, investimento e condições dependem de uma análise da operação. Os termos institucionais definitivos devem ser disponibilizados pela equipe responsável antes da publicação comercial.</p></>}
    <button className="button button-outline" onClick={close}>Entendi<Check size={16} /></button>
  </dialog>;
}
export default function App() {
  const [menu, setMenu] = useState(false);
  const [legal, setLegal] = useState<string | null>(null);
  const [consent, setConsent] = useState(readConsent);
  const [cookieOpen, setCookieOpen] = useState(!readConsent());
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const viewTracked = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    document.documentElement.classList.add('motion-ready');
    if (!viewTracked.current && readConsent() === 'accepted') { track('lp_view'); viewTracked.current = true; }
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') setMenu(false); }
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, []);
  function chooseConsent(choice: string) {
    try { localStorage.setItem(consentKey, choice); } catch { /* Metrics remain disabled without storage. */ }
    setConsent(choice); setCookieOpen(false);
    if (choice === 'accepted' && consent !== 'accepted') track('lp_view');
  }
  function openLegal(kind: string) {
    const url = kind === 'privacy' ? import.meta.env.VITE_PRIVACY_URL : import.meta.env.VITE_TERMS_URL;
    if (url) window.open(url, '_blank', 'noopener,noreferrer'); else setLegal(kind);
  }
  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '');
  return <>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <header className="site-header"><div className="container header-inner"><Brand />
      <nav className={menu ? 'main-nav is-open' : 'main-nav'} aria-label="Navegação principal" id="main-navigation">
        <a href="#metodo" onClick={() => setMenu(false)}>O método</a><a href="#como-funciona" onClick={() => setMenu(false)}>Como funciona</a><a href="#para-quem" onClick={() => setMenu(false)}>Para quem</a><a href="#duvidas" onClick={() => setMenu(false)}>Dúvidas</a>
        <a href="#diagnostico-sac" className="nav-cta" onClick={() => { setMenu(false); track('mid_cta_click'); }}>Diagnóstico SAC<ArrowUpRight size={15} /></a>
      </nav><button className="menu-toggle icon-button" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </div></header>
    <main id="conteudo">
      <section className="hero" id="inicio"><div className="hero-grid-background" aria-hidden="true" /><div className="container hero-layout">
        <div className="hero-copy"><span className="hero-badge"><span className="status-dot" />MÉTODO SAC PARA O CANAL INDIRETO</span>
          <h1>Sua empresa já tem<br className="desktop-break" /> representantes.<br /><span>Agora precisa de um<br className="desktop-break" /> motor de expansão.</span></h1>
          <p className="hero-subtitle">Sua equipe vende para a carteira.<br /><strong>O Método SAC constrói o sistema para expandi-la.</strong></p>
          <p className="hero-description">Aquisição, processo comercial e tecnologia para gerar, organizar e acompanhar novas oportunidades B2B — sem substituir seus representantes.</p>
          <CTA source="hero" className="hero-cta">Iniciar diagnóstico SAC<span className="button-time">2–4 min</span></CTA>
          <div className="hero-reassurance"><ShieldCheck size={14} /><span>Entenda sua operação. Descubra seu próximo passo.</span></div>
        </div><SystemVisual />
      </div><div className="container hero-bottom"><div><span className="small-cross">+</span>MAIS DEMANDA<span className="small-cross">+</span>MAIS CONTROLE<span className="small-cross">+</span>MAIS CRESCIMENTO</div><a href="#estrutura" aria-label="Explorar o método">EXPLORE O MÉTODO<ArrowDown size={15} /></a></div></section>
      <section className="trust-strip" id="estrutura"><div className="container"><p className="trust-caption">ESPECIALIZADO EM QUEM MOVE O MERCADO B2B</p><div className="industry-row">{[[Factory, 'Indústrias'], [PackageCheck, 'Distribuidoras'], [Settings2, 'Fabricantes'], [Globe2, 'Importadoras'], [Building2, 'Operações B2B']].map(([Icon, title]) => { const Symbol = Icon as typeof Factory; return <div key={String(title)}><Symbol size={23} strokeWidth={1.4} /><span>{String(title)}</span></div>; })}</div><div className="trust-signature"><span>Aquisição + Processo Comercial + Tecnologia</span><span>Uma única estrutura. Um objetivo: expansão.<ArrowUpRight size={14} /></span></div></div></section>
      <Diagnostic />
      <section className="section problem-section"><div className="container split-layout">
        <div className="reveal"><Label>O VERDADEIRO GARGALO</Label><h2>O problema não é<br />o representante.<br /><span className="muted-heading">É depender só dele.</span></h2><p>Um bom representante abre clientes e constrói uma carteira. Com o tempo, essa carteira cresce. E isso é ótimo.</p><p className="muted">Mas atender clientes, negociar pedidos, resolver problemas e fazer pós-venda passa a ocupar a rotina. Naturalmente, sobra menos tempo para prospectar.</p><div className="highlight-line">A empresa continua vendendo para quem já compra,<br /><strong>mas abre cada vez menos clientes novos.</strong></div></div>
        <div className="workload-card reveal"><div className="card-topline"><span>A ROTINA DO REPRESENTANTE</span><Users size={18} /></div><h3>Uma carteira maior.<br />O mesmo tempo disponível.</h3><div className="workload-row"><span>Atendimento à carteira</span><span>ROTINA PRIORITÁRIA</span></div><div className="workload-bar">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div><div className="routine-chips"><span>Pedidos</span><span>Relacionamento</span><span>Pós-venda</span><span>Negociação</span></div><div className="time-flow"><ArrowDownLeft size={25} /><span>O espaço para prospectar<br />fica cada vez menor.</span></div><div className="new-accounts"><Radar size={21} /><span>Prospecção de novas contas</span><span className="outline-tag">SEM ROTINA PRÓPRIA</span></div><p className="card-caption">Representação conceitual da rotina comercial.</p></div>
      </div><div className="container manifesto-line reveal"><span>Carteira sustenta faturamento.</span><strong>Aquisição sustenta expansão.<ArrowUpRight /></strong></div></section>
      <section className="section costs-section"><div className="container"><div className="section-heading reveal"><Label>O CUSTO DA DEPENDÊNCIA</Label><h2>Não falta mercado.<br /><span className="muted-heading">Falta um processo para ocupá-lo.</span></h2></div><div className="pain-grid">{pains.map(([title, description], index) => <article className="pain-card reveal" key={title}><span className="card-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p><ArrowDownLeft size={18} /></article>)}</div></div></section>
      <section className="section opportunity-section"><div className="container opportunity-layout"><div className="dual-engine reveal"><div className="engine-card"><Users size={24} /><span>MOTOR 01</span><h3>Seus representantes</h3><p>Relacionamento, carteira<br />e fechamento de negócios.</p><div className="engine-status">FORTALECEM A BASE</div></div><div className="engine-plus"><Plus size={23} /></div><div className="engine-card sac-engine"><Network size={24} /><span>MOTOR 02</span><h3>Método SAC</h3><p>Aquisição, qualificação<br />e novas oportunidades.</p><div className="engine-status"><span className="status-dot" />AMPLIA O MERCADO</div></div><div className="engine-result"><TrendingUp size={19} />UMA OPERAÇÃO. MAIS CAPACIDADE DE EXPANSÃO.</div></div><div className="reveal"><Label>UM SEGUNDO MOTOR DE CRESCIMENTO</Label><h2>Sua carteira bem cuidada.<br /><em>Sua expansão em movimento.</em></h2><p>E se sua empresa pudesse gerar novas oportunidades enquanto seus representantes cuidam da carteira?</p><p className="muted">O SAC adiciona uma camada centralizada para gerar, organizar, acompanhar e desenvolver novas oportunidades B2B. O representante deixa de carregar sozinho a responsabilidade pela expansão.</p><CTA outline>Quero entender minha operação</CTA></div></div></section>
      <section className="section method-section" id="metodo"><div className="container"><div className="section-heading centered reveal"><Label>SISTEMA DE AQUISIÇÃO COMERCIAL</Label><h2>Capacidades conectadas.<br /><em>Expansão estruturada.</em></h2><p>Não é tráfego pago. Não é CRM. Não é automação.<br />É a integração dessas capacidades em um único método.</p></div><div className="pillars-grid">{engines.map((item, index) => <article className="pillar-card reveal" key={item.label}><div className="pillar-top"><item.icon size={26} strokeWidth={1.5} /><span>0{index + 1}</span></div><span className="pillar-label">{item.label}</span><h3>{item.description}</h3><p>{item.detail}</p><div className="pillar-footer"><span>{['ATRAIR', 'PRIORIZAR', 'DESENVOLVER', 'EXPANDIR'][index]}</span><ArrowRight size={17} /></div></article>)}</div><div className="method-equation reveal"><span>Aquisição</span><ArrowRight size={16} /><span>Oportunidade</span><ArrowRight size={16} /><span>Pipeline</span><ArrowRight size={16} /><strong>Expansão<ArrowUpRight size={16} /></strong></div></div></section>
      <section className="section comparison-section"><div className="container"><div className="section-heading reveal"><Label>FAÇA A COMPARAÇÃO</Label><h2>Os mesmos representantes.<br /><span className="muted-heading">Outra velocidade de crescimento.</span></h2></div><div className="comparison-grid reveal"><div className="comparison-column before"><div className="comparison-head"><CircleDot size={22} /><span>OPERAÇÃO ATUAL</span><h3>Prospecção individual</h3><p>A expansão depende de cada pessoa.</p></div>{comparisons.map(([before]) => <div className="comparison-item" key={before}><X size={16} /><span>{before}</span></div>)}</div><div className="comparison-column after"><div className="comparison-head"><Network size={22} /><span>COM O MÉTODO SAC</span><h3>Aquisição estruturada</h3><p>A expansão passa a ter um sistema.</p></div>{comparisons.map(([, after]) => <div className="comparison-item" key={after}><Check size={16} /><span>{after}</span></div>)}</div></div></div></section>
      <section className="section implementation-section" id="como-funciona"><div className="container"><div className="implementation-heading reveal"><div><Label>SEU CAMINHO DENTRO DO SAC</Label><h2>Primeiro, clareza.<br /><em>Depois, estrutura e escala.</em></h2></div><p>Antes de instalar qualquer ferramenta, entendemos onde sua expansão está travando.</p></div><div className="timeline">{timeline.map(([title, description, tag], index) => <article className="timeline-item reveal" key={title}><div className="timeline-number">0{index + 1}</div><span className="timeline-tag">{tag}</span><h3>{title}</h3><p>{description}</p></article>)}</div><div className="centered-cta reveal"><CTA>Quero descobrir o estágio da minha empresa</CTA><span>Diagnóstico de 2 a 4 minutos</span></div></div></section>
      <section className="section capabilities-section"><div className="container split-layout capabilities-layout"><div className="reveal"><Label>O QUE EXISTE POR TRÁS</Label><h2>Mais que ferramentas.<br /><em>Capacidade de expansão.</em></h2><p>Uma estrutura conectada à realidade da sua empresa, do primeiro contato ao acompanhamento comercial.</p><div className="scope-note"><ShieldCheck size={20} /><p>A implementação é definida a partir do diagnóstico. Escopo e prioridades acompanham o estágio da sua operação.</p></div></div><div className="capability-list">{capabilities.map(([Icon, title, description, scoped]) => <article className="capability-item reveal" key={title}><div className="capability-icon"><Icon size={21} /></div><div><h3>{title}</h3><p>{description}</p><span className="included"><Check size={11} />{scoped ? 'INCLUSO CONFORME ESCOPO' : 'INCLUSO'}</span></div></article>)}</div></div></section>
      <section className="section measurement-section"><div className="container measurement-inner reveal"><div><Label>EXPANSÃO PRECISA APARECER EM NÚMEROS</Label><h2>O que importa<br />é o avanço <em>comercial.</em></h2><p>O acompanhamento vai além dos cliques: da entrada de oportunidades à conquista de novos clientes.</p></div><div className="metrics-grid">{[[Target, 'Oportunidades', 'Novas empresas com perfil'], [Users, 'Reuniões e propostas', 'Avanço no processo comercial'], [PackageCheck, 'Novos clientes', 'Contas abertas na carteira'], [TrendingUp, 'Receita atribuída', 'Impacto acompanhado na operação']].map(([Icon, title, description], index) => { const Symbol = Icon as typeof Target; return <div className="metric-item" key={String(title)}><Symbol size={22} /><span className="metric-index">0{index + 1}</span><h3>{String(title)}</h3><p>{String(description)}</p></div>; })}</div></div></section>
      <section className="section specialization-section" id="para-quem"><div className="container split-layout"><div className="territory-visual reveal" aria-hidden="true"><div className="territory-grid" /><div className="territory-ring ring-a" /><div className="territory-ring ring-b" /><div className="territory-ring ring-c" /><div className="territory-hub"><Factory size={34} /></div>{['Representantes', 'Distribuidores', 'Compradores', 'Novas regiões'].map((label, index) => <div key={label} className={'territory-node node-' + index}><span className="status-dot" />{label}</div>)}<svg viewBox="0 0 480 380"><path d="m240 190-145-90m145 90 145-90m-145 90-135 105m135-105 140 100" stroke="#a8f600" strokeOpacity=".3" strokeDasharray="5 6" /></svg><div className="territory-caption"><Crosshair size={13} />CONECTADO À REALIDADE DO CANAL INDIRETO</div></div><div className="reveal"><Label>ESPECIALIZAÇÃO NO CANAL INDIRETO</Label><h2>Seu negócio é B2B.<br /><em>O seu método também.</em></h2><p>Uma indústria que vende para milhares de pontos de venda tem desafios diferentes de quem vende direto ao consumidor.</p><p className="muted">Territórios, distribuidores, representantes, condições comerciais, recorrência e cobertura fazem parte da equação. Adquirir um novo cliente exige conectar a aquisição à realidade da operação.</p><div className="segment-tags">{['Territórios', 'Carteiras', 'Sell-in', 'Mix de produtos', 'Recorrência', 'Expansão geográfica'].map(tag => <span key={tag}>{tag}</span>)}</div></div></div></section>
      <section className="section fit-section"><div className="container"><div className="section-heading centered reveal"><Label>FILTRO HONESTO</Label><h2>O método certo.<br /><span className="muted-heading">Para o momento certo.</span></h2><p>O SAC não é para qualquer operação. E isso faz parte do método.</p></div><div className="fit-grid"><div className="fit-card good-fit reveal"><div className="fit-card-heading"><Check size={22} /><h3>Faz sentido para sua empresa se...</h3></div>{['Já possui produto e operação comercial funcionando', 'Vende para outras empresas pelo canal indireto', 'Tem capacidade para atender novos clientes', 'Conta com representantes ou estrutura comercial', 'Quer aumentar novas contas e expandir regiões', 'Busca reduzir a dependência da prospecção individual', 'Quer mais organização e previsibilidade comercial', 'Está disposta a acompanhar dados e implementar processos'].map(item => <p key={item}><Check size={15} />{item}</p>)}</div><div className="fit-card bad-fit reveal"><div className="fit-card-heading"><X size={22} /><h3>Não é o momento se você...</h3></div>{['Tem um negócio exclusivamente B2C', 'Não possui capacidade para atender novos clientes', 'Procura somente gestão de tráfego', 'Busca apenas um CRM barato', 'Espera resultados sem continuidade da equipe comercial', 'Não pretende acompanhar as oportunidades geradas'].map(item => <p key={item}><X size={15} />{item}</p>)}</div></div></div></section>
      <section className="section authority-section"><div className="container authority-inner reveal"><div><Label>QUEM ESTÁ POR TRÁS</Label><h2>Um método.<br />Duas competências.<br /><em>Uma única estrutura.</em></h2><p>O objetivo não é adicionar fornecedores.<br />É adicionar capacidade de expansão.</p></div><div className="authority-card"><Brand small /><span className="developed-label">DESENVOLVIDO E OPERADO POR</span><div className="partners"><div><strong className="fonil-wordmark">fonil<span>group</span></strong><p>Estratégia e operação de aquisição B2B para indústrias e distribuidoras.</p></div><Plus size={22} /><div><strong className="scalyx-wordmark">scalyx<span>↗</span></strong><p>Infraestrutura, inteligência, organização e tecnologia comercial.</p></div></div><div className="authority-bottom"><Network size={16} />Aquisição + Tecnologia + Operação comercial</div></div></div></section>
      <section className="section urgency-section"><div className="container"><div className="urgency-heading reveal"><Label>O MERCADO NÃO FICA PARADO</Label><h2>Enquanto sua empresa espera,<br /><span className="muted-heading">o mercado continua se movendo.</span></h2></div><div className="urgency-grid">{['Cada representante sobrecarregado tem menos tempo para abrir novas contas.', 'Cada região não prospectada fica disponível para os concorrentes.', 'Cada lead sem acompanhamento pode desaparecer antes de virar oportunidade.', 'Cada mês sem dados mantém a gestão reagindo ao passado.'].map((item, index) => <div className="urgency-item reveal" key={item}><span>0{index + 1}</span><p>{item}</p></div>)}</div></div></section>
      <section className="final-section"><div className="container final-inner reveal"><div className="final-orbits" aria-hidden="true"><i /><i /><i /></div><span className="hero-badge"><span className="status-dot" />SUA PRÓXIMA ETAPA COMEÇA AQUI</span><h2>Sua empresa já construiu uma carteira.<br /><em>Agora construa o que vem depois.</em></h2><p>Descubra onde sua aquisição está travando e qual estrutura pode colocar os próximos clientes dentro da sua operação.</p><CTA source="final">Iniciar diagnóstico SAC<span className="button-time">2–4 min</span></CTA><div className="final-reassurance"><Check size={14} />Análise da operação<Check size={14} />Próximos passos recomendados</div><p className="fine-print">Caso exista aderência entre o método e sua operação,<br />nossa equipe poderá entrar em contato para uma conversa estratégica.</p></div></section>
      <section className="section faq-section" id="duvidas"><div className="container faq-layout"><div className="reveal"><Label>SEM PONTAS SOLTAS</Label><h2>Antes de dar<br /><em>o próximo passo.</em></h2><p>Respostas diretas para as dúvidas<br />mais comuns sobre o Método SAC.</p><CTA outline>Fazer meu diagnóstico</CTA></div><div className="faq-list">{faqs.map(([question, answer], index) => <article className={'faq-item ' + (openFaq === index ? 'is-open' : '')} key={question}><h3><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={'faq-answer-' + index} id={'faq-question-' + index}><span className="faq-number">0{index + 1}</span><span>{question}</span><Plus size={18} /></button></h3><div className="faq-answer" id={'faq-answer-' + index} role="region" aria-labelledby={'faq-question-' + index} hidden={openFaq !== index}><p>{answer}</p></div></article>)}</div></div></section>
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-main"><div><Brand /><p>Expansão comercial estruturada<br />para o canal indireto.</p></div><div className="footer-signature">MARKETING + CRM + RESULTADOS REAIS<span>Desenvolvido e operado por Fonil Group + Scalyx</span></div><a href="#inicio" className="back-top" aria-label="Voltar ao início"><ArrowUpRight size={22} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Método SAC. Todos os direitos reservados.</span><div><button onClick={() => openLegal('privacy')}>Privacidade</button><button onClick={() => openLegal('terms')}>Termos de uso</button><button onClick={() => setCookieOpen(true)}>Cookies</button>{whatsapp && <a href={'https://wa.me/' + whatsapp} target="_blank" rel="noreferrer">WhatsApp<ArrowUpRight size={12} /></a>}</div></div></div></footer>
    {cookieOpen && <aside className="cookie-banner" aria-label="Preferências de privacidade"><ShieldCheck size={22} /><div><strong>Sua privacidade, sua escolha.</strong><p>Usamos armazenamento local para manter seu progresso. Métricas opcionais só com sua autorização. <button onClick={() => openLegal('privacy')}>Saiba mais</button></p></div><div className="cookie-actions"><button onClick={() => chooseConsent('rejected')}>Só essenciais</button><button className="cookie-accept" onClick={() => chooseConsent('accepted')}>Aceitar métricas<Check size={14} /></button></div></aside>}
    {legal && <LegalDialog kind={legal} close={() => setLegal(null)} />}
  </>;
}
