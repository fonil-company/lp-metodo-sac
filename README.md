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

Copie `.env.example` para `.env.local` e defina as variáveis públicas necessárias. Recompile após mudanças.

O envio real só é habilitado quando `VITE_LEAD_ENDPOINT` **e** `VITE_PRIVACY_URL` estão configurados. Até lá, o diagnóstico funciona em modo de apresentação: ao concluir, informa que nada foi enviado e oferece download JSON das respostas.

O endpoint recebe POST JSON com:

- `schema_version`, `event_id`, `created_at`, `source`;
- `answers`: perfil, segmento, faturamento, colaboradores, estrutura comercial, representantes, origem, novos clientes, gargalo, autodiagnóstico, infraestrutura, CRM quando aplicável, autoridade, cargo, timing, budget, capacidade e objetivo;
- `contact`: nome, empresa, WhatsApp normalizado, e-mail, cidade e estado;
- `attribution`: UTMs, fbclid, gclid, ad_id e creative_id da URL;
- `consent`: autorização de contato, URL da política e momento da autorização.

O backend deve validar o payload, persistir o lead, deduplicar por `event_id`, aplicar rate limiting e configurar CORS para o domínio publicado. Deve retornar JSON `{"success": true}` **somente após persistir**. Erros, timeout ou resposta sem confirmação preservam as respostas e permitem nova tentativa com o mesmo ID. Credenciais de CRM devem ficar no servidor; nunca em variáveis `VITE_`.

O evento `diagnostic_submit` só ocorre depois dessa confirmação. Não há integração externa ativa nem credenciais incluídas.

## Analytics

Sem pixels de terceiros instalados. A função `track` envia eventos ao `window.dataLayer` e ao evento DOM `sac:analytics` apenas após consentimento para métricas. Uma equipe de mídia pode conectar seu gerenciador de tags a esses eventos.

Eventos implementados: `lp_view`, `hero_cta_click`, `mid_cta_click`, `final_cta_click`, `diagnostic_start`, `diagnostic_step_25`, `diagnostic_step_50`, `diagnostic_step_75` e `diagnostic_submit`. Dados pessoais de contato não são enviados ao dataLayer.

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
npx playwright test
npm run build
```

Os testes de navegador utilizam o Google Chrome instalado, em modo headless. Validam preenchimento completo, persistência, retorno, CRM condicional, erros, exportação, consentimento, menu, FAQ e overflow em 320, 390, 768, 1024 e 1440 px. Capturas ficam em `test-results/` (ignorado pelo Git).
