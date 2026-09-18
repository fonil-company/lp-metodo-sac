export const diagnosticLabels = {
  profile: 'Perfil da empresa',
  segment: 'Segmento',
  revenue: 'Faturamento mensal',
  employees: 'Colaboradores',
  salesTeam: 'Equipe comercial',
  representatives: 'Representantes comerciais',
  source: 'Origem dos novos clientes',
  newClients: 'Novos clientes por mês',
  selfAssessment: 'Momento da operação',
  authority: 'Papel na decisão',
  role: 'Cargo',
};

export function diagnosticAnswers(answers) {
  return Object.fromEntries(Object.keys(diagnosticLabels)
    .filter(key => typeof answers?.[key] === 'string' && answers[key].trim())
    .map(key => [key, answers[key].trim()]));
}
