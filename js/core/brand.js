// Identidade oficial do produto. Um único lugar para nome, descrição e assinatura.
export const BRAND = {
  name: 'JARVIS',
  tagline: 'Seu Assistente Inteligente Pessoal',
  concept: 'Conhecimento. Evolução. Carreira. Futuro.',
  signature: 'Desenvolvido por Álvaro Pires',
  year: 2026,
  formerName: 'CAREER OS',
};

/**
 * Símbolo do JARVIS: uma órbita aberta. O anel externo fino é o contexto; o arco interno, que
 * não se fecha, é a trajetória em andamento; o nó na ponta do arco é o "agora"; o ponto central,
 * a pessoa. Geométrico e abstrato, sem referência a personagens, franquias ou logotipos existentes.
 */
export function brandMark({ size = 36, id = 'jv', animated = false } = {}) {
  const anim = animated ? ' class="jv-draw"' : '';
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}-g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#4CD3E8"/></linearGradient></defs>
  <circle cx="20" cy="20" r="18" fill="none" stroke="#4CD3E8" stroke-opacity=".28" stroke-width="1"/>
  <path${anim} d="M26 9.61 A12 12 0 1 1 9.61 14" fill="none" stroke="url(#${id}-g)" stroke-width="3" stroke-linecap="round" pathLength="60"/>
  <circle cx="26" cy="9.61" r="2.6" fill="#4CD3E8"/>
  <circle cx="7.27" cy="32.73" r="1.6" fill="#4CD3E8" fill-opacity=".55"/>
  <circle cx="20" cy="20" r="3" fill="currentColor"/>
</svg>`;
}
