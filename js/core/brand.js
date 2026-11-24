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
 * Símbolo do JARVIS: um "J" desenhado como trilha de circuito. O nó ciano no topo representa
 * a inteligência; o traço superior, uma conexão. Geométrico e abstrato, sem referência a
 * personagens ou franquias existentes.
 */
export function brandMark({ size = 36, id = 'jv', animated = false } = {}) {
  const anim = animated ? ' class="jv-draw"' : '';
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}-g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#38BDF8"/></linearGradient></defs>
  <rect x="1" y="1" width="38" height="38" rx="11" fill="#12243A" stroke="#263B55"/>
  <path${anim} d="M13 11 H20" fill="none" stroke="#38BDF8" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
  <circle cx="12" cy="11" r="1.7" fill="#38BDF8" fill-opacity=".7"/>
  <path${anim} d="M25 11 V23.5 A7.5 7.5 0 0 1 17.5 31 H15" fill="none" stroke="url(#${id}-g)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="25" cy="11" r="3.3" fill="#38BDF8"/>
</svg>`;
}
