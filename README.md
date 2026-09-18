# Método SAC — Landing page

Landing page em React, TypeScript e Vite, baseada no briefing de setembro de 2026 e na identidade visual fornecida.

## Executar

Requer Node.js 22 ou superior.

```sh
npm install
npm run dev
```

Acesse http://localhost:5173. Para gerar a versão estática: `npm run build`. Os arquivos publicáveis ficam em `dist/`. Use `npm run preview` para visualizar a compilação.

## Conteúdo e interface

- Fundo preto/grafite, verde performance, tipografia Montserrat e Manrope.
- Logo oficial fornecida em src/Logo sac.png, aplicada também ao favicon e à imagem de compartilhamento.
- Diagrama interativo do método, animações leves em CSS e IntersectionObserver, suporte a movimento reduzido.
- Layout responsivo, navegação mobile, FAQ acessível e links para o diagnóstico.
- As 17 perguntas do briefing estão agrupadas em 10 telas, mais a tela final de contato (11 etapas).
- CRM condicional, máscara de WhatsApp com DDI, validação inline, retorno entre etapas e salvamento em sessionStorage.
- A página utiliza “Sistema de Aquisição de Clientes” na marca, conforme a identidade visual, e “Sistema de Aquisição Comercial” na explicação, conforme o briefing.

## Integração de leads

Copie `.env.example` para `.env.local` e configure `LEAD_WEBHOOK_URL` com a URL completa e o token do receptor atual (Supabase). Para entregar também ao CRM Fonil, configure `FONIL_CRM_WEBHOOK_URL` com a URL completa do webhook desse CRM. Em produção, defina essas variáveis no ambiente de deploy. As URLs ficam somente no servidor e não são incluídas no bundle do navegador.

O formulário envia os leads para `/api/leads`. O servidor faz um POST JSON para cada destino configurado, em paralelo. O Supabase recebe `phone` com DDI, `name`, `company`, `email`, `city`, `state` e as respostas em `answers`. O CRM Fonil recebe os campos documentados `phone`, `name`, `email`, `city` e `state`; telefones brasileiros são enviados apenas com DDD e número, sem `+55`. O backend também aceita os campos opcionais `document`, `pipeline_stage` e `consultant` quando fornecidos; o formulário atual não os coleta e não inventa esses valores.

Para o Fonil, a empresa é enviada como `Empresa`, e as 11 respostas como campos adicionais de texto: `Perfil da empresa`, `Segmento`, `Faturamento mensal`, `Colaboradores`, `Equipe comercial`, `Representantes comerciais`, `Origem dos novos clientes`, `Novos clientes por mês`, `Momento da operação`, `Papel na decisão` e `Cargo`. Esse mapeamento usa o comportamento observado na captura do CRM, que exibe campos adicionais em Observações. Não pressupõe campos nativos de qualificação ou um objeto `notes` não documentado. Apenas respostas conhecidas do formulário são aceitas, sem sobrescrever contato ou UTMs. O mapeamento está em `src/lib/lead-fields.mjs`.

Os dois webhooks recebem os campos de atribuição no primeiro nível do JSON: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, `fbclid`, `gclid`, `ad_id` e `creative_id`, quando presentes, além de `event_id`. Somente o receptor principal recebe os metadados técnicos `event_name: "Lead"`, `landing_url`, `referrer`, `form_url`, `created_at` e os cookies `_fbc` e `_fbp`; eles foram retirados do destino Fonil para não ocupar Observações no lugar das respostas comerciais. O exemplo de contrato Fonil fornecido documenta somente os campos de contato: a persistência dos campos de atribuição na área Origem da campanha precisa ser confirmada no receptor do CRM. Não há envio à API de Conversões da Meta.

A atribuição usa a última entrada com parâmetros de campanha na sessão da aba, armazenada em `sac-attribution-v1`, sem dados pessoais de contato. Navegação sem campanha ou com parâmetros vazios preserva a entrada anterior; uma nova campanha substitui o conjunto completo. A URL e o referrer da entrada são preservados separadamente da URL do formulário e do horário do envio. Sem acesso ao armazenamento, a página mantém a atribuição em memória até ser recarregada.

A API retorna `{ "success": true }` e o evento `diagnostic_submit` ocorre apenas após todos os destinos configurados confirmarem o recebimento. Respostas HTTP de erro, JSON inválido ou uma negativa explícita (`success: false`, `ok: false` ou `error`) impedem a confirmação. Uma resposta vazia com HTTP 2xx do receptor continua sendo aceita.

O `event_id` é encaminhado aos CRMs e usado como `eventID` no Pixel. O navegador mantém esse ID e o JSON completo nas novas tentativas e no recarregamento da aba; alterar os dados de contato ou as respostas do diagnóstico inicia um novo envio. O servidor registra os destinos já confirmados e, nas tentativas seguintes, envia somente aos pendentes. Esse registro dura 24 horas, com limite de 10 mil envios por processo, e armazena apenas o hash dos dados e o status de entrega. Não é uma fila persistente: reiniciar o servidor, usar múltiplas réplicas ou receber um timeout após o CRM já gravar o lead pode resultar em duplicação. Garantia entre processos exige armazenamento compartilhado e idempotência nos receptores. Sem nova tentativa do visitante, uma falha parcial permanece pendente.

Para testar atribuição, abra a página com uma query como `?utm_source=meta&utm_medium=paid_social&utm_campaign=metodo_sac&utm_content=anuncio_01&utm_term=industria`. A URL do webhook identifica o receptor, não a campanha. Um acesso direto sem histórico de campanha continua sem UTMs; nenhum valor é fabricado.

### EasyPanel

1. Preserve `LEAD_WEBHOOK_URL` com o endereço atual do Supabase.
2. Adicione `FONIL_CRM_WEBHOOK_URL` com o endpoint completo do CRM Fonil em **Environment / Variáveis de ambiente**. Cole a URL como texto, sem a sintaxe de link do Markdown.
3. Publique o código atualizado e faça um novo deploy usando o `Dockerfile` do repositório (porta interna 80). O comando do container inicia a API Node e serve a página compilada.
4. Verifique o recebimento nos dois CRMs com um cadastro de teste autorizado.

O mesmo handler de envio é usado em `npm run dev`, `npm run preview` e `npm start`. O arquivo legado `nginx.conf` não é usado pelo Dockerfile; hospedar somente os arquivos estáticos não inicia a API de entrega aos dois CRMs.

## Analytics

A função `track` envia eventos ao `window.dataLayer`, ao evento DOM `sac:analytics`, ao Meta Pixel (`fbq`) e ao Microsoft Clarity (`clarity`), sempre apenas após consentimento para métricas ("Aceitar métricas" no banner de cookies). Os scripts do Pixel e do Clarity só são injetados no navegador nesse momento — nada é carregado antes do consentimento. Uma equipe de mídia pode conectar seu gerenciador de tags aos eventos do dataLayer normalmente.

Eventos implementados: `lp_view`, `hero_cta_click`, `mid_cta_click`, `final_cta_click`, `diagnostic_start`, `diagnostic_step_25`, `diagnostic_step_50`, `diagnostic_step_75` e `diagnostic_submit`. Dados pessoais de contato não são enviados ao dataLayer nem ao Pixel.

No Meta Pixel (ID `1014610764961858`), `lp_view` é enviado como o evento padrão `PageView` e `diagnostic_submit` como `Lead` (com `eventID` para dedup futura com uma Conversions API server-side, se implementada); os demais eventos são enviados como eventos customizados (`trackCustom`) com o mesmo nome, mantendo paridade total com o dataLayer. O fallback `<noscript>` do Pixel foi deliberadamente omitido: ele dispararia o pixel sem possibilidade de checar consentimento (navegador sem JS não executa o banner de cookies), o que contrariaria a política de "métricas só após autorização" adotada no restante do site.

No Microsoft Clarity (projeto `yjx5j5uhnu`), cada evento do dataLayer é replicado como evento customizado via `clarity('event', nome)`, na mesma condição de consentimento.

A página desativa `autoConfig` e `smartSetup` para este Pixel antes da inicialização, evitando que a configuração automática associe cliques à conversão. O único `Lead` explícito depende de formulário válido e resposta positiva da API. As opções foram verificadas no [script oficial do Pixel](https://connect.facebook.net/en_US/fbevents.js), pois a documentação da Meta respondeu HTTP 429 durante a consulta. Regras de clique configuradas externamente no Gerenciador de Eventos ou em outro gerenciador de tags também devem ser revisadas se continuarem disparando eventos; essas configurações externas não foram inspecionadas ou alteradas.

O SAC Score e o evento `qualified_lead` dependem de regras comerciais aprovadas e devem ser calculados no backend. Não foram inventados pesos, limites ou classificações.

## Materiais ainda necessários para publicação comercial

- Logos oficiais de Fonil Group / Scalyx.
- Depoimentos, fotos e logos de clientes autorizados.
- Cases com métricas verificadas e períodos correspondentes.
- CRM/endpoint de recebimento e validação da integração real.
- Faixas de investimento e regras de SAC Score.
- Política de Privacidade e Termos aprovados; número oficial de WhatsApp.
- IDs e configuração de mídia, caso necessários.
- Domínio definitivo para configurar a URL absoluta da imagem de compartilhamento (PNG já incluído).

As áreas de prova social e cases usam, provisoriamente, especialização B2B e indicadores acompanhados. Não há depoimentos, clientes ou resultados fictícios. A pergunta de investimento usa resposta livre ou “depende do projeto”, pois as faixas no briefing estavam sem valores. Não foi publicada escassez não confirmada.

Os diálogos de privacidade e termos são avisos de apresentação, não documentos institucionais definitivos. Fontes são carregadas do Google Fonts; hospede-as localmente se essa for a política da operação.

## Verificações

```sh
npm test
npm run build
npx playwright test
```

Os testes de navegador utilizam o Google Chrome instalado, em modo headless. Validam preenchimento completo, persistência, retorno, CRM condicional, erros, exportação, consentimento, menu, FAQ e overflow em 320, 390, 768, 1024 e 1440 px. Capturas ficam em `test-results/` (ignorado pelo Git).

O teste `production.spec.ts` exige o build e executa a página compilada com a API Node e dois receptores HTTP locais. Verifica os campos efetivamente recebidos, falha parcial com HTTP 200 negativo, reenvio e o `eventID` do único `Lead` confirmado. Os testes não criam cadastros no CRM real nem enviam eventos para a Meta.
