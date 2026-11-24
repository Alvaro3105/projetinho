// Construção de DOM sem innerHTML para conteúdo do usuário.
// Todo texto passa por createTextNode, então dados digitados nunca viram HTML.

/**
 * h('div', { class: 'card', onclick: fn }, 'texto', filho, [lista])
 * - atributos `on*` com função viram event listeners;
 * - `html` só é aceito com strings estáticas do próprio código (ícones SVG);
 * - valores null/undefined/false são ignorados.
 */
export function h(tag, attrs = {}, ...children) {
  const el = tag === 'svg' || attrs?.__svg
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  if (attrs && typeof attrs === 'object' && !(attrs instanceof Node) && !Array.isArray(attrs)) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === '__svg' || value === null || value === undefined || value === false) continue;
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'html') {
        el.innerHTML = value; // somente SVG/markup estático do próprio app
      } else if (key === 'class') {
        el.setAttribute('class', Array.isArray(value) ? value.filter(Boolean).join(' ') : value);
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else if (key === 'style' && typeof value === 'object') {
        // Variáveis CSS (--nome) precisam de setProperty; Object.assign as ignoraria.
        for (const [prop, v] of Object.entries(value)) {
          if (v === null || v === undefined) continue;
          if (prop.startsWith('--')) el.style.setProperty(prop, String(v)); else el.style[prop] = v;
        }
      } else if (value === true) {
        el.setAttribute(key, '');
      } else if (key === 'value' && 'value' in el) {
        el.value = value;
      } else {
        el.setAttribute(key, String(value));
      }
    }
  } else if (attrs !== null && attrs !== undefined) {
    children.unshift(attrs);
  }
  append(el, children);
  return el;
}

export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false || child === '') continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/** Aceita apenas http(s). Bloqueia javascript:, data: etc. em links digitados. */
export function safeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

/** Link externo seguro; se a URL for inválida mostra o texto sem link. */
export function extLink(url, label) {
  const href = safeUrl(url);
  if (!href) return h('span', { class: 'faint' }, label || url || '');
  let text = label;
  if (!text) {
    try { const u = new URL(href); text = u.host + (u.pathname.length > 1 ? u.pathname : ''); } catch { text = href; }
  }
  return h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
