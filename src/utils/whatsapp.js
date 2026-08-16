export function normalizarWhatsApp(contato) {
  if (!contato) return null;
  const digitos = String(contato).replace(/\D+/g, '');
  if (digitos.length === 0) return null;
  if (digitos.startsWith('55')) return digitos;
  if (digitos.length >= 10 && digitos.length <= 12) return '55' + digitos;
  return null;
}

export function montarMensagemAprovacao(candidato, codigo) {
  const site = 'https://rilexy-langpage.vercel.app/';
  return `Olá, ${candidato.nome}! Sua candidatura à Rilaxy foi aprovada. Seu código de acesso é ${codigo}. Baixe o app em ${site} e configure seu PIN pessoal para começar.`;
}

export function linkWhatsApp(numero, mensagem) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
