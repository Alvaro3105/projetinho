import { h } from '../core/dom.js';
import { today, fmtDate } from '../core/dates.js';
import { routinePlan, weeklyHours, currentPhase } from '../core/metrics.js';
import { daysSinceExport } from '../core/store.js';
import { card, btn, pageHead, notice, chips, stat, tabs } from '../ui/components.js';
import { openModal, closeModal, confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const DAYS = [['seg', 'Seg'], ['ter', 'Ter'], ['qua', 'Qua'], ['qui', 'Qui'], ['sex', 'Sex'], ['sab', 'Sáb'], ['dom', 'Dom']];
let tab = 'rotina';

const ROUTINES = {
  minima: { title: 'Rotina mínima (dias difíceis)', text: '30 min: 20 min de um problema de lógica sem IA ou leitura do material atual + 10 min de inglês (listening). Objetivo: não quebrar a sequência. Registrar a sessão mesmo assim.' },
  normal: { title: 'Rotina normal (período letivo)', text: 'Faculdade primeiro. Estudo extra conforme a disponibilidade abaixo, em blocos de 45–90 min. Um bloco por dia tem foco único. Domingo: revisão semanal de 15–20 min.' },
  ferias: { title: 'Rotina de férias (maior dedicação)', text: 'Blocos de manhã para o assunto mais difícil (programação/matemática), tarde para projeto, inglês distribuído. Pelo menos 1 dia livre por semana. Atividade física e sono continuam inegociáveis.' },
};

export function renderSettings(ctx) {
  const { store, rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Configurações', 'Rotina, disponibilidade, perfil, tema e backup dos dados.'),
    tabs([['rotina', 'Rotina e disponibilidade'], ['perfil', 'Perfil'], ['dados', 'Dados e backup'], ['aparencia', 'Aparência']], tab, (k) => { tab = k; rerender(); }),
    tab === 'rotina' ? routine(ctx) : tab === 'perfil' ? profile(ctx) : tab === 'dados' ? data(ctx) : appearance(ctx));
}

function routine({ store, rerender }) {
  const s = store.state.settings;
  const phase = currentPhase(today());
  const plan = routinePlan(s, phase.value);
  const total = weeklyHours(s);
  const grid = (key, values) => h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))' } }, DAYS.map(([d, label]) => h('div', { class: 'field' },
    h('label', { for: `${key}-${d}` }, label),
    h('input', { id: `${key}-${d}`, type: 'number', min: 0, max: 12, step: 0.5, value: values?.[d] ?? 0, inputmode: 'decimal', onchange: (e) => {
      const n = Math.max(0, Math.min(12, Number(e.target.value) || 0));
      store.setSettings({ [key]: { ...(s[key] || s.availability), [d]: n } });
    } }))));
  return h('div', { class: 'stack' },
    card({ title: 'Modo de rotina desta semana', iconName: 'clock', sub: 'Troque sem culpa. Consistência vale mais que intensidade.' },
      chips([['minima', 'Mínima'], ['normal', 'Normal'], ['ferias', 'Férias']], s.routineMode, (k) => store.setSettings({ routineMode: k }), 'Modo de rotina'),
      h('p', { class: 'small', style: { marginTop: '12px' } }, h('strong', {}, ROUTINES[s.routineMode].title, ': '), ROUTINES[s.routineMode].text)),
    h('div', { class: 'grid cols-2' },
      card({ title: 'Disponibilidade — rotina normal (horas extras por dia)', sub: 'Além das aulas. Seja realista: conte transporte, trabalho e descanso.' }, grid('availability', s.availability)),
      card({ title: 'Disponibilidade — férias', sub: 'Usada quando o modo é "Férias".' }, grid('availabilityVacation', s.availabilityVacation || { seg: 4, ter: 4, qua: 4, qui: 4, sex: 3, sab: 3, dom: 0 }))),
    card({ title: `Distribuição sugerida — ${phase.label}`, iconName: 'chart', meta: `${total}h por semana` },
      h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Frente'), h('th', { scope: 'col', class: 'num' }, 'Horas/semana'))),
        h('tbody', {}, plan.map((p) => h('tr', {}, h('td', {}, p.area), h('td', { class: 'num' }, `${p.hours}h`)))))),
      total > 25 && s.routineMode === 'normal' ? notice('Mais de 25 h extras por semana durante o período letivo tende a não se sustentar com faculdade e trabalho. Considere reduzir.', 'warn') : null,
      h('p', { class: 'small faint', style: { marginTop: '8px' } }, 'Pesos por fase definidos no plano (ver Guia). Atividade física, sono e vida pessoal não entram nessa conta e não devem ser cortados para caber estudo.')));
}

function profile({ store }) {
  const p = store.state.profile;
  const fields = [['name', 'Nome de exibição'], ['city', 'Cidade'], ['school', 'Formação atual'], ['university', 'Graduação'], ['startDate', 'Início da retomada', 'date'], ['github', 'GitHub', 'url'], ['portfolio', 'Portfólio', 'url'], ['linkedin', 'LinkedIn', 'url']];
  const inputs = {};
  const mission = h('textarea', { id: 'pf-mission' }, p.mission || '');
  const objectives = h('textarea', { id: 'pf-obj', rows: '5' }, (p.objectives || []).join('\n'));
  return card({ title: 'Perfil' },
    h('form', { class: 'form', onsubmit: (e) => { e.preventDefault(); save(); } },
      fields.map(([k, label, type]) => {
        inputs[k] = h('input', { id: `pf-${k}`, type: type || 'text', value: p[k] || '', maxlength: 200 });
        return h('div', { class: 'field' }, h('label', { for: `pf-${k}` }, label), inputs[k]);
      }),
      h('div', { class: 'field full' }, h('label', { for: 'pf-mission' }, 'Missão'), mission),
      h('div', { class: 'field full' }, h('label', { for: 'pf-obj' }, 'Objetivos principais (um por linha)'), objectives),
      h('div', { class: 'full' }, btn('Salvar perfil', () => save(), { kind: 'primary', iconName: 'check', type: 'submit' }))));
  function save() {
    const patch = {};
    for (const [k, , type] of fields) {
      const v = inputs[k].value.trim();
      if (type === 'url' && v && !/^https?:\/\//i.test(v)) { inputs[k].setAttribute('aria-invalid', 'true'); inputs[k].focus(); toast('Links precisam começar com https://', { error: true }); return; }
      patch[k] = v;
    }
    patch.mission = mission.value.trim();
    patch.objectives = objectives.value.split('\n').map((x) => x.trim()).filter(Boolean);
    store.setProfile(patch);
    toast('Perfil salvo.');
  }
}

function data({ store }) {
  const days = daysSinceExport(store.state);
  const counts = Object.entries(store.state.collections).reduce((a, [, v]) => a + v.length, 0);
  const doExport = () => {
    store.markExported(); // antes de exportar, para o arquivo já levar a data do backup
    const json = store.exportJSON();
    let downloaded = false;
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: `careeros-backup-${today()}.json` });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      downloaded = true;
    } catch { downloaded = false; }
    showJSON(json, downloaded);
  };
  return h('div', { class: 'stack' },
    notice(h('span', {}, h('strong', {}, 'Onde ficam seus dados: '), 'somente neste navegador (localStorage), neste dispositivo. Não há servidor nem sincronização. Limpar os dados do navegador, usar janela anônima ou trocar de computador apaga ou esconde tudo. Faça backup semanal e guarde o arquivo em um lugar seu (Google Drive, pendrive, repositório privado).'), 'warn'),
    !store.persistent ? notice('O navegador está bloqueando o armazenamento local. As alterações desta sessão serão perdidas ao fechar a página. Exporte um backup antes de sair.', 'bad') : null,
    h('div', { class: 'grid cols-3' },
      card({}, stat('Registros', String(counts), 'em todas as coleções')),
      card({}, stat('Último backup', days === null ? 'Nunca' : days === 0 ? 'Hoje' : `há ${days} dia(s)`, store.state.meta.lastExportAt ? fmtDate(store.state.meta.lastExportAt.slice(0, 10)) : 'Exporte agora', { na: days === null })),
      card({}, stat('Configuração inicial', store.state.meta.seedVersion || '—', 'versão dos dados iniciais'))),
    card({ title: 'Backup', iconName: 'download' },
      h('div', { class: 'row' },
        btn('Exportar backup (JSON)', doExport, { kind: 'primary', iconName: 'download' }),
        btn('Importar backup', () => importDialog(store), { iconName: 'upload' })),
      h('p', { class: 'small faint', style: { marginTop: '10px' } }, 'A importação valida o arquivo e substitui todos os dados atuais. Exporte antes de importar.')),
    card({ title: 'Zona de risco', iconName: 'alert' },
      h('div', { class: 'row' },
        btn('Restaurar configuração inicial', async () => {
          if (await confirmDialog({ title: 'Restaurar configuração inicial', message: 'Todos os seus registros serão apagados e o sistema volta ao estado inicial (perfil, competências não avaliadas, plano). Exporte um backup antes. Continuar?', confirmLabel: 'Apagar e restaurar', danger: true })) { store.reset({ withSeed: true }); toast('Configuração inicial restaurada.'); }
        }, { kind: 'danger', iconName: 'trash' }),
        btn('Apagar tudo (sistema vazio)', async () => {
          if (await confirmDialog({ title: 'Apagar tudo', message: 'Apagar todos os dados e começar com o sistema vazio? Isso não pode ser desfeito sem backup.', confirmLabel: 'Apagar tudo', danger: true })) { store.reset({ withSeed: false }); toast('Dados apagados.'); }
        }, { kind: 'danger' }))));
}

function showJSON(json, downloaded) {
  const area = h('textarea', { id: 'bk-json', readonly: true, style: { minHeight: '220px', fontFamily: 'var(--font-mono)', fontSize: '12px' } }, json);
  openModal({
    title: 'Backup exportado',
    body: h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, downloaded ? 'O download do arquivo foi iniciado. Se o navegador bloqueou o download, copie o conteúdo abaixo e salve como arquivo .json.' : 'Copie o conteúdo abaixo e salve como arquivo .json.'),
      h('div', { class: 'field' }, h('label', { for: 'bk-json' }, 'Conteúdo do backup'), area)),
    footer: [btn('Fechar', () => closeModal(), { kind: 'ghost' }), btn('Copiar', async () => {
      try { await navigator.clipboard.writeText(json); toast('Backup copiado.'); } catch { area.focus(); area.select(); toast('Selecionei o texto: use Ctrl+C para copiar.'); }
    }, { kind: 'primary', iconName: 'copy' })],
  });
}

function importDialog(store) {
  const file = h('input', { type: 'file', id: 'bk-file', accept: 'application/json,.json' });
  const area = h('textarea', { id: 'bk-paste', placeholder: 'Ou cole aqui o conteúdo do backup', style: { minHeight: '160px', fontFamily: 'var(--font-mono)', fontSize: '12px' } });
  const err = h('p', { class: 'small', style: { color: 'var(--danger)' }, role: 'alert' });
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { err.textContent = 'Arquivo maior que 10 MB. Não parece um backup do CAREER OS.'; return; }
    const reader = new FileReader();
    reader.onload = () => { area.value = String(reader.result || ''); err.textContent = ''; };
    reader.onerror = () => { err.textContent = 'Não foi possível ler o arquivo.'; };
    reader.readAsText(f);
  });
  openModal({
    title: 'Importar backup',
    body: h('div', { class: 'stack' },
      h('div', { class: 'field' }, h('label', { for: 'bk-file' }, 'Arquivo .json'), file),
      h('div', { class: 'field' }, h('label', { for: 'bk-paste' }, 'Conteúdo'), area), err),
    footer: [btn('Cancelar', () => closeModal(), { kind: 'ghost' }), btn('Substituir dados', () => {
      if (!area.value.trim()) { err.textContent = 'Escolha um arquivo ou cole o conteúdo.'; return; }
      try {
        store.importJSON(area.value);
        closeModal();
        toast('Backup importado.');
      } catch (e) { err.textContent = e.message; }
    }, { kind: 'primary', iconName: 'upload' })],
  });
}

function appearance({ store }) {
  return card({ title: 'Tema', sub: 'O escuro é o padrão do CAREER OS. O claro preserva a sidebar azul-marinho.' },
    chips([['dark', 'Escuro'], ['light', 'Claro'], ['system', 'Seguir o sistema']], store.state.settings.theme, (k) => store.setSettings({ theme: k }), 'Tema'));
}
