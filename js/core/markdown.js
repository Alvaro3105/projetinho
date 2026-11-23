// Renderizador de Markdown mínimo e seguro: constrói DOM (sem innerHTML).
// Suporta títulos, parágrafos, listas (com um nível de aninhamento), tabelas,
// citações, blocos de código, regra horizontal, **negrito**, *itálico*, `código` e [links](url).
import { h, safeUrl } from './dom.js';

export function inline(text) {
  const out = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2]) out.push(h('strong', {}, inline(m[2])));
    else if (m[3]) out.push(h('em', {}, m[3]));
    else if (m[4]) out.push(h('code', {}, m[4]));
    else if (m[5]) {
      const href = safeUrl(m[6]);
      out.push(href ? h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, m[5]) : m[5]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

export function renderMarkdown(src, { headingOffset = 1, idPrefix = 'md' } = {}) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const root = h('div', { class: 'prose' });
  const toc = [];
  let i = 0;
  let para = [];
  const flush = () => { if (para.length) { root.append(h('p', {}, inline(para.join(' ')))); para = []; } };

  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      root.append(h('div', { class: 'table-wrap' }, h('pre', { style: { margin: 0, padding: '12px', fontSize: '12px' } }, h('code', {}, buf.join('\n')))));
      continue;
    }
    const hm = line.match(/^(#{1,4})\s+(.*)$/);
    if (hm) {
      flush();
      const level = Math.min(6, hm[1].length + headingOffset);
      const id = `${idPrefix}-${toc.length}`;
      if (hm[1].length <= 2) toc.push({ id, text: hm[2], level: hm[1].length });
      root.append(h(`h${level}`, { id, style: { marginTop: hm[1].length === 1 ? '0' : '1.4em', marginBottom: '0.5em' } }, inline(hm[2])));
      i++;
      continue;
    }
    if (/^---+\s*$/.test(line)) { flush(); root.append(h('hr')); i++; continue; }
    if (/^>\s?/.test(line)) {
      flush();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      root.append(h('div', { class: 'notice', style: { margin: '12px 0' } }, h('div', {}, inline(buf.join(' ')))));
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flush();
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      root.append(h('div', { class: 'table-wrap', style: { margin: '12px 0' } }, h('table', {},
        h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, inline(c))))),
        h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, inline(c)))))))));
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      flush();
      const ordered = /^\s*\d+\./.test(line);
      const list = h(ordered ? 'ol' : 'ul', { style: { margin: '8px 0' } });
      let lastLi = null;
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const raw = lines[i];
        const indent = raw.match(/^\s*/)[0].length;
        const text = raw.replace(/^\s*([-*]|\d+\.)\s+/, '');
        if (indent >= 2 && lastLi) {
          let sub = lastLi.querySelector(':scope > ul');
          if (!sub) { sub = h('ul'); lastLi.append(sub); }
          sub.append(h('li', {}, inline(text)));
        } else {
          lastLi = h('li', {}, inline(text));
          list.append(lastLi);
        }
        i++;
      }
      root.append(list);
      continue;
    }
    if (!line.trim()) { flush(); i++; continue; }
    para.push(line.trim());
    i++;
  }
  flush();
  return { node: root, toc };
}
