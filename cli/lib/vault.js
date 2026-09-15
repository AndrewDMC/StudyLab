'use strict';
// Lettura/scrittura del vault: materie, mazzi di flashcard, materia.yml.
// Niente dipendenze esterne: parsing YAML fatto a mano perché i file
// materia.yml e i frontmatter delle carte hanno una struttura volutamente
// piatta e semplice (vedi CLAUDE.md).

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = path.resolve(__dirname, '..', '..');
const MATERIE_DIR = path.join(VAULT_ROOT, 'materie');

function listMaterie() {
  return fs
    .readdirSync(MATERIE_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((slug) => fs.existsSync(path.join(MATERIE_DIR, slug, 'materia.yml')));
}

// Parser minimale per materia.yml: chiave: valore su una riga, valori
// scalari (stringa/numero) o null. Basta per i campi che il CLI legge.
function readMateriaYml(slug) {
  const file = path.join(MATERIE_DIR, slug, 'materia.yml');
  const content = fs.readFileSync(file, 'utf8');
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim();
    if (val === '' || val.startsWith('|')) continue; // blocchi multilinea: ignorati dal CLI

    const quotato = val.match(/^"([^"]*)"\s*(?:#.*)?$/);
    if (quotato) {
      val = quotato[1];
    } else {
      // Toglie un eventuale commento inline "# ..." non tra virgolette,
      // altrimenti "scritto  # orale | scritto | misto" resta nel valore.
      val = val.replace(/\s+#.*$/, '').trim();
      if (val === 'null') val = null;
      else if (/^-?\d+$/.test(val)) val = parseInt(val, 10);
    }
    out[key] = val;
  }
  return out;
}

function flashcardFiles(slug) {
  const dir = path.join(MATERIE_DIR, slug, '04-flashcard');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));
}

const CARD_RE =
  /^## \[([^\]]+)\] (.+?)\r?\n\?\r?\n([\s\S]*?)<!-- srs: ([0-9a-f]{6}) -->\r?\n<!-- stato: (\w+) -->/gm;

// Estrae le carte da un mazzo. Ogni carta conserva la posizione esatta nel
// testo originale (start/end) per permettere una sostituzione mirata senza
// toccare il resto del file (frontmatter, altre carte, commenti umani).
function parseDeck(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const cards = [];
  let m;
  CARD_RE.lastIndex = 0;
  while ((m = CARD_RE.exec(content)) !== null) {
    cards.push({
      file: filePath,
      concetto: m[1],
      domanda: m[2].trim(),
      risposta: m[3].trim(),
      srsId: m[4],
      stato: m[5],
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return { content, cards };
}

// Sostituisce lo stato ("proposta" | "attiva" | "sospesa") di una carta
// identificata dal suo srsId, ovunque si trovi nel vault.
function setCardStato(srsId, nuovoStato) {
  for (const slug of listMaterie()) {
    for (const file of flashcardFiles(slug)) {
      const { content, cards } = parseDeck(file);
      const card = cards.find((c) => c.srsId === srsId);
      if (!card) continue;
      const nuovoBlocco = content
        .slice(card.start, card.end)
        .replace(/<!-- stato: \w+ -->/, `<!-- stato: ${nuovoStato} -->`);
      const nuovoContent = content.slice(0, card.start) + nuovoBlocco + content.slice(card.end);
      fs.writeFileSync(file, nuovoContent, 'utf8');
      return true;
    }
  }
  return false;
}

// Rimuove del tutto una carta dal mazzo (scelta "scarta" in curazione).
function deleteCard(srsId) {
  for (const slug of listMaterie()) {
    for (const file of flashcardFiles(slug)) {
      const { content, cards } = parseDeck(file);
      const card = cards.find((c) => c.srsId === srsId);
      if (!card) continue;
      // Rimuove anche l'eventuale riga vuota lasciata dopo il blocco.
      let end = card.end;
      if (content.slice(end, end + 2) === '\r\n') end += 2;
      else if (content[end] === '\n') end += 1;
      const nuovoContent = content.slice(0, card.start) + content.slice(end);
      fs.writeFileSync(file, nuovoContent, 'utf8');
      return true;
    }
  }
  return false;
}

// Frontmatter di un file .md qualunque (lezione, concetto...): stessa
// sintassi piatta di materia.yml, letta con lo stesso parser di riga.
function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fm = {};
  const blocco = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!blocco) return fm;
  for (const line of blocco[1].split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim().replace(/^"(.*)"$/, '$1').replace(/^\[|\]$/g, '');
    fm[key] = val;
  }
  return fm;
}

// Elenco dei concetti (frontmatter di 02-concetti/*.md), per materia o per
// tutto il vault. Usato sia dal browser dei concetti sia dalla dashboard
// per calcolare la copertura (quanti concetti non hanno ancora carte).
function listConcetti(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, '02-concetti');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({
        materia: slug,
        id: fm.id,
        titolo: fm.titolo || '',
        tipo: fm.tipo || '',
        stato: fm.stato || '',
        confidenza: fm.confidenza ? parseInt(fm.confidenza, 10) : 0,
        tag: fm.tag || '',
      });
    }
  }
  return out;
}

// Elenco delle lezioni (frontmatter di 01-lezioni/*.md): serve alla
// dashboard per sapere quante sono ancora "grezzo" (da schematizzare).
function listLezioni(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, '01-lezioni');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({ materia: slug, titolo: fm.titolo || f, data: fm.data || null, stato: fm.stato || 'grezzo' });
    }
  }
  return out;
}

// Quanti elementi (foto, PDF, testo) attendono ancora /cattura in 00-inbox/,
// escludendo _processati/ e i file di servizio come .gitkeep.
function inboxDaProcessare(slug) {
  const dir = path.join(MATERIE_DIR, slug, '00-inbox');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile() && d.name !== '.gitkeep').length;
}

function allCards({ soloStato = null } = {}) {
  const out = [];
  for (const slug of listMaterie()) {
    const materiaInfo = readMateriaYml(slug);
    for (const file of flashcardFiles(slug)) {
      const { cards } = parseDeck(file);
      for (const c of cards) {
        if (soloStato && c.stato !== soloStato) continue;
        out.push({ ...c, materia: slug, materiaNome: materiaInfo.nome || slug });
      }
    }
  }
  return out;
}

module.exports = {
  VAULT_ROOT,
  MATERIE_DIR,
  listMaterie,
  readMateriaYml,
  readFrontmatter,
  flashcardFiles,
  parseDeck,
  setCardStato,
  deleteCard,
  allCards,
  listConcetti,
  listLezioni,
  inboxDaProcessare,
};
