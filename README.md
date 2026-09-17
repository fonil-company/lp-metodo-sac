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

Copie `.env.example` para `.env.local` e configure `LEAD_WEBHOOK_URL` com a URL completa e o token do receptor. Em produção, defina a mesma variável no ambiente de deploy. A URL fica somente no servidor e não é incluída no bundle do navegador.

O formulário envia os leads ao webhook configurado por meio do proxy de mesma origem em `/api/leads`, evitando bloqueios de CORS no navegador. O POST JSON segue o contrato com `phone`, `name`, `company`, `email`, `city` e `state`. O telefone é normalizado com DDI antes do envio.

As respostas detalhadas do diagnóstico, o nome da empresa e a atribuição de mídia não fazem parte do contrato desse webhook e, por isso, não são enviados como campos extras. O evento `diagnostic_submit` só ocorre depois de uma resposta HTTP bem-sucedida. Erros ou timeout preservam as respostas e permitem nova tentativa com o mesmo ID de evento local.

## Analytics

A função `track` envia eventos ao `window.dataLayer`, ao evento DOM `sac:analytics` e ao Meta Pixel (`fbq`), sempre apenas após consentimento para métricas ("Aceitar métricas" no banner de cookies). O script do Pixel só é injetado no navegador nesse momento — nada é carregado antes do consentimento. Uma equipe de mídia pode conectar seu gerenciador de tags aos eventos do dataLayer normalmente.

Eventos implementados: `lp_view`, `hero_cta_click`, `mid_cta_click`, `final_cta_click`, `diagnostic_start`, `diagnostic_step_25`, `diagnostic_step_50`, `diagnostic_step_75` e `diagnostic_submit`. Dados pessoais de contato não são enviados ao dataLayer nem ao Pixel.

No Meta Pixel (ID `1014610764961858`), `lp_view` é enviado como o evento padrão `PageView` e `diagnostic_submit` como `Lead` (com `eventID` para dedup futura com uma Conversions API server-side, se implementada); os demais eventos são enviados como eventos customizados (`trackCustom`) com o mesmo nome, mantendo paridade total com o dataLayer. O fallback `<noscript>` do Pixel foi deliberadamente omitido: ele dispararia o pixel sem possibilidade de checar consentimento (navegador sem JS não executa o banner de cookies), o que contrariaria a política de "métricas só após autorização" adotada no restante do site.

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
