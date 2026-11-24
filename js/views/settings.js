import { h } from '../core/dom.js';
import { today, fmtDate } from '../core/dates.js';
import { PHASES } from '../core/schema.js';
import { routinePlan, currentPhase, WORK_SCENARIOS, VACATION_DEFAULTS, scenarioOf, currentSemester, semesterHours, AVERAGE_SEMESTER_HOURS } from '../core/metrics.js';
import { daysSinceExport } from '../core/store.js';
import { card, btn, pageHead, notice, chips, stat, tabs } from '../ui/components.js';
import { typedConfirm, snapshotNow } from './backup.js';
import { toast } from '../ui/toast.js';

const DAYS = [['seg', 'Seg'], ['ter', 'Ter'], ['qua', 'Qua'], ['qui', 'Qui'], ['sex', 'Sex'], ['sab', 'Sáb'], ['dom', 'Dom']];
let tab = 'rotina';

const ROUTINES = {
  minima: { title: 'Rotina mínima (dias difíceis)', text: '30 min: 20 min de um problema de lógica sem IA ou leitura do material atual + 10 min de inglês (listening). Objetivo: não quebrar a sequência. Registrar a sessão mesmo assim.' },
  normal: { title: 'Rotina normal (período letivo)', text: 'Faculdade primeiro. Estudo extra conforme o cenário de trabalho e a disponibilidade abaixo, em blocos de 45–90 min com foco único. Em semestres com carga acima da média, o plano reduz o estudo extra automaticamente. Domingo: revisão semanal de 15–20 min.' },
  ferias: { title: 'Rotina de férias (maior dedicação)', text: 'Blocos de manhã para o assunto mais difícil (programação/matemática), tarde para projeto, inglês distribuído. Pelo menos 1 dia livre por semana. Se o estágio continuar nas férias, use o modo normal com o cenário de estágio. Atividade física e sono continuam inegociáveis.' },
};

export function renderSettings(ctx) {
  const { store, rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Configurações', 'Rotina, disponibilidade, perfil, tema e backup dos dados.'),
    tabs([['rotina', 'Rotina e disponibilidade'], ['perfil', 'Perfil'], ['dados', 'Dados e backup'], ['aparencia', 'Aparência']], tab, (k) => { tab = k; rerender(); }),
    tab === 'rotina' ? routine(ctx) : tab === 'perfil' ? profile(ctx) : tab === 'dados' ? data(ctx) : appearance(ctx));
}

function routine({ store }) {
  const s = store.state.settings;
  const semester = currentSemester(store.list('semesters'));
  // Com um semestre em curso, a fase vem dele (1º–2º → Fase 2, 3º–4º → Fase 3...); senão, da data.
  const phase = semester ? PHASES.find((p) => p.value === Math.min(5, Math.ceil(semester.number / 2) + 1)) : currentPhase(today());
  const plan = routinePlan(s, phase.value, { semester });
  const fh = (n) => `${String(n).replace('.', ',')}h`;
  const scenario = scenarioOf(s);
  const grid = (key, values) => h('div', { class: 'grid', style: { gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))' } }, DAYS.map(([d, label]) => h('div', { class: 'field' },
    h('label', { for: `${key}-${d}` }, label),
    h('input', { id: `${key}-${d}`, type: 'number', min: 0, max: 12, step: 0.5, value: values?.[d] ?? 0, inputmode: 'decimal', onchange: (e) => {
      const n = Math.max(0, Math.min(12, Number(e.target.value) || 0));
      store.setSettings({ [key]: { ...values, [d]: n } });
    } }))));
  const scenarioValues = s[scenario.key] || scenario.defaults;
  const hours = semester ? semesterHours(semester) : 0;
  return h('div', { class: 'stack' },
    card({ title: 'Modo de rotina desta semana', iconName: 'clock', sub: 'Troque sem culpa. Consistência vale mais que intensidade.' },
      chips([['minima', 'Mínima'], ['normal', 'Normal'], ['ferias', 'Férias']], s.routineMode, (k) => store.setSettings({ routineMode: k }), 'Modo de rotina'),
      h('p', { class: 'small', style: { marginTop: '12px' } }, h('strong', {}, ROUTINES[s.routineMode].title, ': '), ROUTINES[s.routineMode].text)),
    card({ title: 'Cenário de trabalho', iconName: 'briefcase', sub: 'Estudar à noite não significa ter o dia inteiro livre. Cada cenário tem a própria disponibilidade; mude quando sua situação mudar.' },
      chips(WORK_SCENARIOS.map((w) => [w.value, w.label]), scenario.value, (k) => store.setSettings({ workScenario: k }), 'Cenário de trabalho'),
      h('p', { class: 'small muted', style: { marginTop: '12px' } }, scenario.note)),
    h('div', { class: 'grid cols-2' },
      card({ title: `Disponibilidade — ${scenario.label} (horas extras por dia)`, sub: 'Além das aulas e do estágio. Conte deslocamento, descanso e família.' }, grid(scenario.key, scenarioValues)),
      card({ title: 'Disponibilidade — férias', sub: 'Usada quando o modo é "Férias".' }, grid('availabilityVacation', s.availabilityVacation || VACATION_DEFAULTS))),
    card({ title: `Distribuição sugerida — ${phase.label}`, iconName: 'chart', meta: `${fh(plan.total)} por semana` },
      plan.factor < 1 ? notice(`${semester.number}º período em curso: ${hours} h de disciplinas, acima da média de ${AVERAGE_SEMESTER_HOURS} h por período. O estudo extra foi reduzido de ${fh(plan.declared)} para ${fh(plan.total)} por semana (fator ${plan.factor.toFixed(2).replace('.', ',')}). Prioridade: aprovação e as disciplinas centrais.`, 'warn') : null,
      h('div', { class: 'table-wrap', style: { marginTop: plan.factor < 1 ? '12px' : '0' } }, h('table', {},
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Frente'), h('th', { scope: 'col', class: 'num' }, 'Horas/semana'))),
        h('tbody', {}, plan.map((p) => h('tr', {}, h('td', {}, p.area), h('td', { class: 'num' }, fh(p.hours))))))),
      plan.total > 25 && s.routineMode === 'normal' ? notice('Mais de 25 h extras por semana durante o período letivo tende a não se sustentar com faculdade e trabalho. Considere reduzir.', 'warn') : null,
      h('p', { class: 'small faint', style: { marginTop: '8px' } }, 'Pesos por fase definidos no plano (ver Guia › Desenvolvimento pessoal e rotina). O ajuste por carga vale no modo normal, durante um semestre. Atividade física, sono e vida pessoal não entram nessa conta e não devem ser cortados para caber estudo.')));
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
      h('div', { class: 'full' }, btn('Salvar perfil', null, { kind: 'primary', iconName: 'check', type: 'submit' }))));
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

function data({ store, navigate }) {
  const days = daysSinceExport(store.state);
  const counts = Object.entries(store.state.collections).reduce((a, [, v]) => a + v.length, 0);
  return h('div', { class: 'stack' },
    notice(h('span', {}, h('strong', {}, 'Onde ficam seus dados: '), 'somente neste navegador, neste dispositivo. Não há servidor nem sincronização. Limpar os dados do navegador, usar janela anônima ou trocar de computador apaga ou esconde tudo. Faça backup semanal na Central de Backup e guarde o arquivo em um lugar seu.'), 'warn'),
    !store.persistent ? notice('O navegador não está conseguindo salvar (armazenamento bloqueado ou espaço cheio). As alterações desta sessão serão perdidas ao fechar a página. Exporte um backup antes de sair.', 'bad') : null,
    h('div', { class: 'grid cols-3' },
      card({}, stat('Registros', String(counts), 'em todas as coleções')),
      card({}, stat('Último backup', days === null ? 'Nunca' : days === 0 ? 'Hoje' : `Há ${days} dia(s)`, store.state.meta.lastExportAt ? fmtDate(store.state.meta.lastExportAt.slice(0, 10)) : 'Exporte agora', { na: days === null })),
      card({}, stat('Configuração inicial', store.state.meta.seedVersion ? fmtDate(store.state.meta.seedVersion) : '—', 'versão dos dados iniciais'))),
    card({ title: 'Backup e restauração', iconName: 'lock', sub: 'Exportação (JSON com selo de integridade e CSV), importação com prévia, pontos de restauração automáticos, histórico e verificação de integridade ficam na Central de Backup.' },
      btn('Abrir a Central de Backup', () => navigate('backup'), { kind: 'primary', iconName: 'arrow' })),
    card({ title: 'Zona de risco', iconName: 'alert', sub: 'Operações irreversíveis sem backup. Antes de qualquer uma delas, o JARVIS cria um ponto de restauração automático (quando o navegador permite).' },
      h('div', { class: 'row' },
        btn('Restaurar configuração inicial', async () => {
          if (!await typedConfirm({ title: 'Restaurar configuração inicial', message: 'Todos os seus registros serão substituídos pelo estado inicial (perfil, competências não avaliadas, plano). Um ponto de restauração será criado antes.', word: 'RESTAURAR', confirmLabel: 'Restaurar' })) return;
          await snapshotNow(store, 'Antes de restaurar a configuração inicial');
          store.reset({ withSeed: true });
          toast('Configuração inicial restaurada. Os dados anteriores estão nos pontos de restauração.');
        }, { kind: 'danger', iconName: 'trash' }),
        btn('Apagar tudo (sistema vazio)', async () => {
          if (!await typedConfirm({ title: 'Apagar tudo', message: 'Todos os dados serão apagados e o sistema ficará vazio. Um ponto de restauração será criado antes.', word: 'APAGAR', confirmLabel: 'Apagar tudo' })) return;
          await snapshotNow(store, 'Antes de apagar tudo');
          store.reset({ withSeed: false });
          toast('Dados apagados. Os dados anteriores estão nos pontos de restauração.');
        }, { kind: 'danger' }))));
}

function appearance({ store }) {
  return card({ title: 'Tema', sub: 'O escuro é o padrão do JARVIS. O claro preserva a barra lateral azul-marinho.' },
    chips([['dark', 'Escuro'], ['light', 'Claro'], ['system', 'Seguir o sistema']], store.state.settings.theme, (k) => store.setSettings({ theme: k }), 'Tema'));
}
