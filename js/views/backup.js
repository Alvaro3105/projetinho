// Central de Backup: exportação (JSON com selo de integridade e CSV), importação com prévia,
// pontos de restauração automáticos, histórico e verificação de integridade dos dados.
import { h, clear } from '../core/dom.js';
import { today, fmtDate, fmtDateTime } from '../core/dates.js';
import { COLLECTIONS, daysSinceExport } from '../core/store.js';
import {
  buildBackup, verifyBackup, toCSV, auditData, repairReferences, createSnapshot, listSnapshots, readSnapshot,
  COLLECTION_LABELS, countsOf,
} from '../core/backup.js';
import { BRAND } from '../core/brand.js';
import { card, btn, pageHead, notice, stat, tabs, badge, empty } from '../ui/components.js';
import { openModal, closeModal, confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Pontos de restauração (IndexedDB), recebidos pelo contexto de renderização. */
let snapshots = null;
export function setSnapshotBackend(b) { snapshots = b; }

let tab = 'exportar';
let auditResult = null;

// Dentro do claude.ai, a capacidade "downloads" salva o arquivo com confirmação sua.
// Fora dele (computador, GitHub Pages), window.claude não existe e usamos o download do navegador.
const downloadsCap = typeof window !== 'undefined' && window.claude?.use
  ? window.claude.use('downloads').catch(() => null)
  : Promise.resolve(null);
const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);

/**
 * Salva um arquivo de texto. Resultado:
 * 'saved' (você confirmou no claude.ai) · 'declined' (você recusou) · 'browser' (download iniciado) · 'blocked'.
 */
export async function saveFile(filename, text, mime) {
  const cap = await withTimeout(downloadsCap, 1500);
  if (cap) {
    try { await cap.save({ filename, data: text }); return 'saved'; }
    catch (e) { if (e?.code === 'declined') return 'declined'; /* indisponível: tenta o navegador */ }
  }
  return downloadText(filename, text, mime) ? 'browser' : 'blocked';
}

/** Download pelo navegador. Retorna false se o ambiente bloquear (o modal oferece cópia). */
export function downloadText(filename, text, mime) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = h('a', { href: url, download: filename });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch {
    return false;
  }
}

const fmtBytes = (n) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1).replace('.', ',')} KB` : `${(n / 1024 / 1024).toFixed(2).replace('.', ',')} MB`);
const totalOf = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

/** Confirmação que exige digitar uma palavra (operações irreversíveis). */
export function typedConfirm({ title, message, word, confirmLabel }) {
  return new Promise((resolve) => {
    let done = false;
    const input = h('input', { id: 'confirm-word', type: 'text', autocomplete: 'off' });
    const finish = (v) => { done = true; resolve(v); closeModal(); };
    openModal({
      title, size: 'sm',
      body: h('div', { class: 'stack' }, h('p', { class: 'muted' }, message),
        h('div', { class: 'field' }, h('label', { for: 'confirm-word' }, `Digite ${word} para confirmar`), input)),
      footer: [btn('Cancelar', () => finish(false), { kind: 'ghost' }), btn(confirmLabel, () => {
        if (input.value.trim().toUpperCase() !== word) { input.setAttribute('aria-invalid', 'true'); input.focus(); toast(`Digite ${word} para confirmar.`, { error: true }); return; }
        finish(true);
      }, { kind: 'danger' })],
      onClose: () => { if (!done) resolve(false); },
    });
  });
}

async function snapshotNow(store, reason) {
  if (!snapshots) return null;
  try { return await createSnapshot(snapshots, store.state, reason); } catch { return null; }
}

export function renderBackup(ctx) {
  const { store, rerender } = ctx;
  if (ctx.snapshots !== undefined) snapshots = ctx.snapshots;
  const days = daysSinceExport(store.state);
  const total = totalOf(countsOf(store.state));
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Central de Backup', `Seus dados ficam somente neste navegador. Aqui você exporta, restaura e verifica tudo o que registrou no ${BRAND.name}.`),
    days === null || days > 7 ? notice(days === null ? 'Você ainda não fez nenhum backup. Exporte agora e guarde o arquivo em um lugar seu (Google Drive, pendrive, repositório privado).' : `Seu último backup foi há ${days} dias. O recomendado é um por semana.`, 'warn') : null,
    !store.persistent ? notice('O navegador não está conseguindo salvar (armazenamento bloqueado ou espaço cheio). Exporte um backup agora: as alterações desta sessão serão perdidas ao fechar a página.', 'bad') : null,
    h('div', { class: 'grid cols-4' },
      card({}, stat('Registros', String(total), `${COLLECTIONS.length} tipos de dados`)),
      card({}, stat('Último backup', days === null ? 'Nunca' : days === 0 ? 'Hoje' : `Há ${days} dia(s)`, store.state.meta.lastExportAt ? fmtDateTime(store.state.meta.lastExportAt) : 'Exporte agora', { na: days === null })),
      card({}, stat('Backups registrados', String((store.state.meta.backupHistory || []).length), 'Histórico das exportações')),
      card({}, stat('Pontos de restauração', snapshots ? 'Ativos' : 'Indisponível', snapshots ? 'Automáticos, neste navegador' : 'Este navegador não oferece IndexedDB', { na: !snapshots }))),
    tabs([['exportar', 'Exportar'], ['importar', 'Importar e restaurar'], ['pontos', 'Pontos de restauração'], ['historico', 'Histórico'], ['integridade', 'Verificar integridade']], tab, (k) => { tab = k; rerender(); }),
    tab === 'exportar' ? exportTab(ctx) : tab === 'importar' ? importTab(ctx) : tab === 'pontos' ? snapshotsTab(ctx) : tab === 'historico' ? historyTab(ctx) : integrityTab(ctx));
}

// ---------- Exportar ----------
function exportTab({ store }) {
  const exportJSON = async () => {
    const at = new Date();
    const { json, hash, counts, bytes } = await buildBackup(store.state, at);
    const filename = `jarvis-backup-${today()}.json`;
    const result = await saveFile(filename, json, 'application/json');
    if (result === 'declined') { toast('Exportação cancelada. Nenhum backup foi registrado.'); return; }
    // Registra no histórico quando o arquivo foi salvo ou o download começou; se o ambiente
    // bloqueou, registra só depois que você copiar o conteúdo.
    const record = () => store.markExported({ at: at.toISOString(), kind: 'json', filename, bytes, hash, counts });
    if (result === 'saved') { record(); toast(`Backup salvo (${filename}).`); return; }
    if (result === 'browser') record();
    showExport({ text: json, filename, downloaded: result === 'browser', hash, onCopy: result === 'blocked' ? record : null });
  };
  const exportCSV = async (c) => {
    const text = toCSV(store.state, c);
    const filename = `jarvis-${c}-${today()}.csv`;
    const result = await saveFile(filename, text, 'text/csv;charset=utf-8');
    if (result === 'declined') { toast('Exportação cancelada.'); return; }
    const record = () => store.markExported({ kind: 'csv', filename, bytes: text.length, counts: { [c]: store.list(c).length } });
    if (result === 'blocked') { showExport({ text, filename, downloaded: false, onCopy: record }); return; }
    record();
    toast(result === 'saved' ? `${COLLECTION_LABELS[c]} salvo em CSV.` : `${COLLECTION_LABELS[c]}: download do CSV iniciado.`);
  };
  return h('div', { class: 'stack' },
    card({ title: 'Backup completo (JSON)', iconName: 'download', sub: 'Contém tudo: competências e histórico, estudos, anotações, notas, projetos, candidaturas, marcos, preferências, rotinas e planejamento. É o arquivo que permite restaurar o JARVIS inteiro.' },
      h('ul', { class: 'small muted', style: { marginBottom: '12px' } },
        h('li', {}, 'Inclui um selo de integridade SHA-256: na importação, o JARVIS confere se o arquivo não foi alterado ou corrompido.'),
        h('li', {}, 'Guarde o arquivo fora deste navegador. Limpar os dados do navegador apaga também os pontos de restauração.')),
      btn('Exportar backup completo', exportJSON, { kind: 'primary', iconName: 'download' })),
    card({ title: 'Planilhas (CSV)', iconName: 'chart', sub: 'Para abrir no Excel ou no Google Planilhas e analisar. Separador ";" e acentos preservados. CSV não serve para restaurar o sistema: use o backup completo.' },
      h('div', { class: 'list' }, COLLECTIONS.map((c) => h('div', { class: 'list-item' },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, COLLECTION_LABELS[c]), h('div', { class: 'sub' }, `${store.list(c).length} registro(s)`)),
        btn('CSV', () => exportCSV(c), { size: 'sm', iconName: 'download', disabled: !store.list(c).length, title: `Exportar ${COLLECTION_LABELS[c]} em CSV` }))))));
}

function showExport({ text, filename, downloaded, hash, onCopy }) {
  const area = h('textarea', { id: 'bk-json', readonly: true, style: { minHeight: '200px', fontFamily: 'var(--font-mono)', fontSize: '12px' } }, text);
  openModal({
    title: 'Backup exportado',
    body: h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, downloaded
        ? `Confira se o arquivo ${filename} apareceu nos seus downloads. Alguns ambientes bloqueiam downloads sem avisar (por exemplo, a visualização dentro do claude.ai): nesse caso, copie o conteúdo abaixo e salve como ${filename.endsWith('.csv') ? '.csv' : '.json'}.`
        : `O download foi bloqueado neste ambiente. Copie o conteúdo abaixo e salve como ${filename}.`),
      hash ? h('p', { class: 'small' }, 'Selo de integridade (SHA-256): ', h('code', {}, `${hash.slice(0, 16)}…`)) : h('p', { class: 'small faint' }, 'Sem selo de integridade: este navegador não oferece criptografia nesta página (abra por https ou localhost).'),
      h('div', { class: 'field' }, h('label', { for: 'bk-json' }, 'Conteúdo'), area)),
    footer: [btn('Fechar', () => closeModal(), { kind: 'ghost' }), btn('Copiar', async () => {
      try { await navigator.clipboard.writeText(text); toast('Conteúdo copiado.'); } catch { area.focus(); area.select(); toast('Texto selecionado: use Ctrl+C para copiar.'); }
      if (onCopy) { onCopy(); onCopy = null; }
    }, { kind: 'primary', iconName: 'copy' })],
  });
}

// ---------- Importar / restaurar ----------
function importTab({ store }) {
  const file = h('input', { type: 'file', id: 'bk-file', accept: 'application/json,.json' });
  const area = h('textarea', { id: 'bk-paste', placeholder: 'Ou cole aqui o conteúdo do backup', style: { minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '12px' } });
  const out = h('div', { class: 'stack', 'aria-live': 'polite' });
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { clear(out).append(notice('Arquivo maior que 20 MB. Não parece um backup do JARVIS.', 'bad')); return; }
    const reader = new FileReader();
    reader.onload = () => { area.value = String(reader.result || ''); check(); };
    reader.onerror = () => clear(out).append(notice('Não foi possível ler o arquivo.', 'bad'));
    reader.readAsText(f);
  });
  async function check() {
    clear(out);
    if (!area.value.trim()) { out.append(notice('Escolha um arquivo ou cole o conteúdo.', 'warn')); return; }
    const v = await verifyBackup(area.value);
    out.append(previewCard(store, v));
  }
  return card({ title: 'Importar backup', iconName: 'upload', sub: 'O arquivo é verificado antes de qualquer mudança. Você vê o que ele contém e confirma. Antes de substituir, o JARVIS cria um ponto de restauração com os dados atuais.' },
    h('div', { class: 'stack' },
      h('div', { class: 'field' }, h('label', { for: 'bk-file' }, 'Arquivo .json'), file),
      h('div', { class: 'field' }, h('label', { for: 'bk-paste' }, 'Conteúdo'), area),
      h('div', {}, btn('Verificar arquivo', check, { iconName: 'check' })),
      out));
}

function previewCard(store, v) {
  const cur = countsOf(store.state);
  const hashBadge = { ok: badge('Selo de integridade confere', 'ok'), divergente: badge('Selo de integridade NÃO confere', 'bad'), ausente: badge('Sem selo de integridade', 'warn'), indisponivel: badge('Selo não verificado neste navegador', 'warn') }[v.hashStatus];
  return h('div', { class: 'stack' },
    v.errors.map((e) => notice(e, 'bad')),
    v.warnings.map((w) => notice(w, 'warn')),
    v.state ? h('div', { class: 'stack' },
      h('div', { class: 'row' }, hashBadge, v.exportedAt ? badge(`Exportado em ${fmtDateTime(v.exportedAt)}`, 'plain') : null, v.app ? badge(`Origem: ${v.app}`, 'plain') : null),
      h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Tipo de dado'), h('th', { scope: 'col', class: 'num' }, 'No arquivo'), h('th', { scope: 'col', class: 'num' }, 'Atual'))),
        h('tbody', {}, COLLECTIONS.filter((c) => v.counts[c] || cur[c]).map((c) => h('tr', {}, h('td', {}, COLLECTION_LABELS[c]), h('td', { class: 'num' }, String(v.counts[c])), h('td', { class: 'num' }, String(cur[c]))))))),
      v.ok ? h('div', {}, btn('Substituir meus dados por este backup', async () => {
        if (!await confirmDialog({ title: 'Substituir dados', message: `Todos os dados atuais (${totalOf(cur)} registros) serão substituídos pelos do arquivo (${totalOf(v.counts)} registros). Um ponto de restauração com os dados atuais será criado antes. Continuar?`, confirmLabel: 'Substituir', danger: true })) return;
        const snap = await snapshotNow(store, 'Antes de importar um backup');
        store.replaceState(v.state);
        toast(snap ? 'Backup importado. Os dados anteriores estão em Pontos de restauração.' : 'Backup importado.');
      }, { kind: 'primary', iconName: 'upload' })) : null) : null);
}

// ---------- Pontos de restauração ----------
function snapshotsTab({ store, rerender }) {
  const host = h('div', { class: 'stack' }, h('p', { class: 'muted' }, 'Carregando…'));
  if (!snapshots) {
    clear(host).append(notice('Este navegador não oferece IndexedDB, então não há pontos de restauração automáticos. Use o backup completo (JSON).', 'warn'));
    return host;
  }
  (async () => {
    let list = [];
    try { list = await listSnapshots(snapshots); } catch (e) { clear(host).append(notice(`Não foi possível ler os pontos de restauração: ${e.message}`, 'bad')); return; }
    clear(host).append(
      card({ title: 'Pontos de restauração', iconName: 'cycle', sub: 'Cópias automáticas criadas antes de importar, restaurar, apagar dados e atualizar o JARVIS. Guardadas neste navegador (os 10 mais recentes). Não substituem o backup em arquivo.' },
        h('div', { style: { marginBottom: '12px' } }, btn('Criar ponto agora', async () => {
          const s = await snapshotNow(store, 'Criado manualmente');
          toast(s ? 'Ponto de restauração criado.' : 'Não foi possível criar o ponto (espaço insuficiente?).', { error: !s });
          rerender();
        }, { iconName: 'plus' })),
        list.length ? h('div', { class: 'list' }, list.map((s) => h('div', { class: 'list-item' },
          h('div', { class: 'grow' }, h('div', { class: 'title' }, `${fmtDateTime(s.createdAt)} · ${s.reason}`), h('div', { class: 'sub' }, `${totalOf(s.counts)} registros · ${fmtBytes(s.bytes)}`)),
          btn('Restaurar', async () => {
            if (!await confirmDialog({ title: 'Restaurar ponto', message: `Voltar os dados para ${fmtDateTime(s.createdAt)} (${s.reason})? Os dados atuais viram um novo ponto de restauração antes.`, confirmLabel: 'Restaurar', danger: true })) return;
            try {
              const st = await readSnapshot(snapshots, s.id);
              await snapshotNow(store, 'Antes de restaurar um ponto');
              store.replaceState(st);
              toast('Dados restaurados.');
            } catch (e) { toast(e.message, { error: true }); }
          }, { size: 'sm', iconName: 'upload' })))) : empty('Nenhum ponto de restauração ainda.', 'O primeiro é criado automaticamente na próxima importação, restauração ou atualização. Você também pode criar um agora.')));
  })();
  return host;
}

// ---------- Histórico ----------
function historyTab({ store }) {
  const list = store.state.meta.backupHistory || [];
  return card({ title: 'Histórico de backups', iconName: 'clock', sub: 'Registro das exportações feitas neste navegador (as 30 mais recentes). Ele também vai dentro de cada backup.' },
    list.length ? h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Data e hora', 'Tipo', 'Arquivo', 'Tamanho', 'Registros', 'Selo'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, list.map((b) => h('tr', {},
        h('td', {}, fmtDateTime(b.at)), h('td', {}, b.kind === 'csv' ? 'CSV' : 'Completo (JSON)'), h('td', { style: { overflowWrap: 'anywhere' } }, b.filename || '—'),
        h('td', { class: 'num' }, b.bytes ? fmtBytes(b.bytes) : '—'), h('td', { class: 'num' }, b.counts ? String(totalOf(b.counts)) : '—'),
        h('td', {}, b.hash ? h('code', {}, b.hash.slice(0, 10)) : '—')))))) : empty('Nenhum backup registrado.', 'Exporte o primeiro na aba Exportar.'));
}

// ---------- Integridade ----------
function integrityTab({ store, rerender }) {
  const run = () => { auditResult = { at: new Date().toISOString(), ...auditData(store.state) }; rerender(); };
  const r = auditResult;
  const dangling = r ? r.issues.filter((i) => i.ref) : [];
  return card({ title: 'Verificar integridade dos dados', iconName: 'check', sub: 'Confere ids repetidos, referências a registros que não existem mais e datas inválidas. A verificação não altera nada.' },
    h('div', { class: 'row', style: { marginBottom: '12px' } }, btn('Verificar agora', run, { kind: 'primary', iconName: 'check' }),
      dangling.length ? btn(`Remover ${dangling.length} referência(s) quebrada(s)`, async () => {
        if (!await confirmDialog({ title: 'Corrigir referências', message: 'Só as ligações para registros inexistentes serão removidas. Nenhum registro é apagado. Um ponto de restauração será criado antes.', confirmLabel: 'Corrigir' })) return;
        await snapshotNow(store, 'Antes de corrigir referências');
        const { state, fixed } = repairReferences(store.state);
        store.replaceState(state);
        auditResult = null;
        toast(`${fixed} referência(s) corrigida(s).`);
      }) : null),
    !r ? h('p', { class: 'small muted' }, 'Ainda não verificado nesta sessão.')
      : r.issues.length === 0 ? notice(`Tudo certo: ${r.total} registros verificados em ${fmtDateTime(r.at)}, sem problemas.`, 'info')
        : h('div', { class: 'stack' }, notice(`${r.issues.length} ponto(s) de atenção em ${r.total} registros (${fmtDateTime(r.at)}).`, 'warn'),
          h('ul', { class: 'small' }, r.issues.slice(0, 50).map((i) => h('li', {}, `${i.level === 'erro' ? 'Erro' : 'Aviso'}: ${i.message}`)))));
}

export { snapshotNow };
