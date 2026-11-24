// Efeitos sonoros opcionais e discretos. Desativados por padrão (Configurações › Aparência).
// Sintetizados com Web Audio (nenhum arquivo baixado). Só tocam logo depois de uma ação sua
// (clique ou tecla): nada toca sozinho ao abrir a página ou por um evento em segundo plano.
let enabled = false;
let ctx = null;
let lastGesture = 0;

const TONES = {
  concluir: [[660, 0, 0.09], [990, 0.07, 0.14]], // dois toques ascendentes, curtos
  salvar: [[740, 0, 0.08]],
  erro: [[220, 0, 0.16]],
  abrir: [[520, 0, 0.05]],
};

export function setSoundEnabled(on) { enabled = !!on; }

export function installSoundGestures() {
  const mark = () => { lastGesture = performance.now(); };
  document.addEventListener('pointerdown', mark, true);
  document.addEventListener('keydown', mark, true);
}

/** Toca um som curto se a opção estiver ligada e houve uma ação sua há menos de 1,5 s. */
export function play(name) {
  if (!enabled || !TONES[name]) return;
  if (performance.now() - lastGesture > 1500) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime;
    for (const [freq, at, dur] of TONES[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + at);
      gain.gain.exponentialRampToValueAtTime(0.045, t0 + at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + at);
      osc.stop(t0 + at + dur + 0.02);
    }
  } catch { /* navegador sem Web Audio: segue em silêncio */ }
}
