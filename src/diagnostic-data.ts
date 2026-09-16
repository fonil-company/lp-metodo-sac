export type Question = { id: string; label: string; options?: string[]; placeholder?: string; optional?: boolean; type?: 'text' };
export const steps: { title: string; subtitle: string; questions: Question[] }[] = [
  { title: 'Vamos conhecer sua operação.', subtitle: 'Tudo começa entendendo o contexto da sua empresa.', questions: [
    { id: 'profile', label: 'Qual é o perfil da sua empresa?', options: ['Indústria', 'Distribuidora', 'Fabricante', 'Importadora', 'Atacadista', 'Outro negócio B2B'] },
    { id: 'segment', label: 'Em qual segmento sua empresa atua?', options: ['Alimentos e bebidas', 'Farmacêutico', 'Cosméticos', 'Materiais de construção', 'Autopeças', 'Agro', 'Máquinas e equipamentos', 'Químico', 'Embalagens', 'Higiene e limpeza', 'Pet', 'Tecnologia/equipamentos', 'Utilidades', 'Outro'] }
  ]},
  { title: 'Qual é o tamanho da sua empresa?', subtitle: 'Essas informações ajudam a dimensionar sua estrutura.', questions: [
    { id: 'revenue', label: 'Qual é o faturamento médio mensal da empresa?', options: ['Até R$ 100 mil/mês', 'R$ 100 mil a R$ 300 mil/mês', 'R$ 300 mil a R$ 500 mil/mês', 'R$ 500 mil a R$ 1 milhão/mês', 'R$ 1 milhão a R$ 3 milhões/mês', 'R$ 3 milhões a R$ 10 milhões/mês', 'Acima de R$ 10 milhões/mês'] },
    { id: 'employees', label: 'Quantos colaboradores a empresa possui atualmente?', options: ['1 a 10', '11 a 30', '31 a 50', '51 a 100', '101 a 300', 'Mais de 300'] }
  ]},
  { title: 'Como é sua estrutura comercial?', subtitle: 'Queremos entender quem participa das suas vendas.', questions: [
    { id: 'salesTeam', label: 'Quantas pessoas atuam diretamente na área comercial?', options: ['1 a 5', '6 a 10', '11 a 20', '21 a 50', 'Mais de 50'] },
    { id: 'representatives', label: 'Quantos representantes comerciais ou vendedores externos sua empresa possui?', options: ['1 a 5', '6 a 15', '16 a 30', '31 a 50', 'Mais de 50'] }
  ]},
  { title: 'De onde vêm seus novos clientes?', subtitle: 'Vamos olhar para a aquisição, além da carteira atual.', questions: [
    { id: 'source', label: 'Hoje, de onde vêm a maioria dos novos clientes da empresa?', options: ['Prospecção dos representantes', 'Prospecção da equipe interna', 'Indicações', 'Carteira e relacionamento', 'Feiras e eventos', 'Marketing digital', 'Outbound / SDR', 'Site / busca orgânica', 'Marketplaces', 'Não temos um canal previsível de aquisição'] },
    { id: 'newClients', label: 'Aproximadamente quantos novos clientes entram na carteira em um mês normal?', options: ['Nenhum ou quase nenhum', '1 a 5', '6 a 15', '16 a 30', '31 a 50', 'Mais de 50', 'Não acompanhamos esse indicador'] }
  ]},
  { title: 'Como você enxerga o momento atual?', subtitle: 'Sua percepção ajuda a identificar a prioridade certa.', questions: [
    { id: 'selfAssessment', label: 'Qual dessas frases melhor descreve sua operação atualmente?', options: ['Vendemos bem para a carteira, mas abrimos poucos clientes novos', 'Temos capacidade de vender mais, mas faltam oportunidades', 'Geramos oportunidades, mas perdemos muitas durante o processo comercial', 'Temos vendedores, mas falta processo e acompanhamento', 'Estamos crescendo e queremos acelerar a expansão', 'Queremos abrir novas regiões ou canais', 'Ainda estamos estruturando nossa operação comercial'] }
  ]},
  { title: 'Qual é o seu papel nessa mudança?', subtitle: 'Para conectar a estratégia às pessoas certas.', questions: [
    { id: 'authority', label: 'Qual é o seu papel na decisão sobre projetos de expansão comercial?', options: ['Sou o principal decisor', 'Decido junto com outros sócios/diretores', 'Influencio a decisão', 'Sou responsável por avaliar fornecedores e apresentar internamente', 'Não participo diretamente da decisão'] },
    { id: 'role', label: 'Qual é o seu cargo?', options: ['Sócio / Proprietário', 'CEO / Presidente', 'Diretor', 'Diretor Comercial', 'Gerente Comercial', 'Gestor de Expansão', 'Gerente de Marketing', 'Coordenador', 'Outro'] }
  ]}
];
