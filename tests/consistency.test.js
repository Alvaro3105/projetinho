// Consistência entre a matriz curricular (código), o documento da faculdade e o plano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SEMESTERS, totalHours, MATH_TRACK, CURRICULUM_SOURCE } from '../js/data/curriculum.js';
import { emptyState } from '../js/core/store.js';
import { seed } from '../js/core/seed.js';
import { PHASES } from '../js/core/schema.js';
import { RESOURCES } from '../js/data/resources.js';

const doc = readFileSync(new URL('../docs/03-faculdade-puc-minas.md', import.meta.url), 'utf8');

function docSemesters() {
  const parts = doc.split(/^### (\d)º período — (\d{4}\/\d) · .*\((\d+) h\)$/m);
  const out = [];
  for (let i = 1; i < parts.length; i += 4) {
    const rows = [...parts[i + 3].matchAll(/^\| ([^|]+?) \| (\d+) h \|$/gm)].map((m) => ({ name: m[1].trim(), hours: Number(m[2]) }));
    out.push({ number: Number(parts[i]), term: parts[i + 1], total: Number(parts[i + 2]), rows });
  }
  return out;
}

test('documento da faculdade = matriz do código (nomes, cargas, totais, períodos)', () => {
  const fromDoc = docSemesters();
  assert.equal(fromDoc.length, 8);
  for (const sem of SEMESTERS) {
    const d = fromDoc.find((x) => x.number === sem.number);
    assert.ok(d, `período ${sem.number} ausente no documento`);
    assert.equal(d.term, sem.term, `período letivo do ${sem.number}º`);
    assert.equal(d.total, totalHours(sem), `total do ${sem.number}º no título`);
    assert.deepEqual(d.rows, sem.disciplines.map((x) => ({ name: x.name, hours: x.hours })), `disciplinas do ${sem.number}º`);
  }
  assert.equal(SEMESTERS.reduce((a, s) => a + s.disciplines.length, 0), 62);
  assert.equal(SEMESTERS.reduce((a, s) => a + totalHours(s), 0), 4522);
  assert.match(doc, /4\.522 h/);
});

test('procedência da matriz: consultada em 21/11/2026, pendente de confirmação', () => {
  assert.equal(CURRICULUM_SOURCE.consulted, '2026-11-21');
  assert.equal(CURRICULUM_SOURCE.status, 'pendente_confirmacao');
  assert.match(doc, /consultada na página oficial da PUC Minas em \*\*21\/11\/2026\*\*/);
  assert.match(doc, /pendente de confirmação com a documentação da sua matrícula de 2027/);
});

test('plano: marcos dentro das fases, dependências em ordem, datas de matemática coerentes', () => {
  const s = emptyState();
  seed(s);
  const c = s.collections;
  for (const m of c.milestones) {
    const p = PHASES.find((x) => x.value === Number(m.phase));
    if (m.due) assert.ok(m.due >= p.start && m.due < p.end, `marco fora da fase: ${m.title}`);
    for (const id of m.dependsOn) {
      const dep = c.milestones.find((x) => x.id === id);
      if (dep.due && m.due) assert.ok(dep.due <= m.due, `dependência termina depois: ${m.title} ← ${dep.title}`);
    }
  }
  const third = c.milestones.filter((m) => m.due >= '2028-02-01' && m.due <= '2028-07-15');
  assert.deepEqual(third.map((m) => m.title), ['3º período (708 h) concluído sem sobrecarga'], 'nenhum outro marco vence no 3º período');
  const sk = (n) => c.skills.find((x) => x.name === n);
  const ms = (t) => c.milestones.find((x) => x.title.startsWith(t));
  assert.equal(sk('Matemática discreta').targetDate, ms('Matemática Discreta completa').due);
  assert.equal(sk('Álgebra linear').targetDate, ms('Álgebra Linear I e II').due);
  assert.ok(MATH_TRACK.some((m) => m.when.startsWith('2028/1') && /Nenhuma|nenhuma/.test(m.why)), '3º período sem matemática extra');
  for (const id of ['mit1806', 'mml', 'cs50ai', 'gmlcc', 'islp']) assert.ok(RESOURCES.find((r) => r.id === id).phase >= 4, `recurso de IA/álgebra antes da hora: ${id}`);
});
