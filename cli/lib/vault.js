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
// Separa il blocco frontmatter (--- ... ---) dal corpo di un file .md.
// Usata sia per leggere solo i metadati (readFrontmatter) sia per il
// viewer, dove il corpo va renderizzato con un parser Markdown vero: senza
// separarlo prima, il `---` del frontmatter viene letto come hr/setext
// heading dal parser e ne corrompe il rendering.
function separaFrontmatter(content) {
  const blocco = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!blocco) return { fm: {}, corpo: content };
  const fm = {};
  for (const line of blocco[1].split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim().replace(/^"(.*)"$/, '$1').replace(/^\[|\]$/g, '');
    fm[key] = val;
  }
  return { fm, corpo: blocco[2] };
}

function readFrontmatter(filePath) {
  return separaFrontmatter(fs.readFileSync(filePath, 'utf8')).fm;
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
        file: f,
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
      out.push({ materia: slug, file: f, titolo: fm.titolo || f, data: fm.data || null, stato: fm.stato || 'grezzo' });
    }
  }
  return out;
}

// Elenco delle sintesi (frontmatter di 03-sintesi/*.md), più recenti prima
// — per il viewer "Materiali" e per sapere se esiste già una settimanale
// prima di generare la mensile corrispondente (vedi skill /compatta).
function listSintesi(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, '03-sintesi');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({ materia: slug, file: f, tipo: fm.tipo || '', periodo: fm.periodo || '', generato: fm.generato || null });
    }
  }
  out.sort((a, b) => (b.periodo || '').localeCompare(a.periodo || ''));
  return out;
}

// Elenco ricorsivo dei file sorgente in 05-esami/originali/ (PDF, scan),
// percorso relativo alla RADICE DELLA MATERIA (es.
// "05-esami/originali/secondo-parziale/2008-06-16.pdf") — quella
// struttura ha sottocartelle libere (es.
// "anni-precedenti/Testi-esami-anni-precedenti/", "secondo-parziale/"),
// non un livello solo. Stesso formato di percorso usato dal campo `fonte`
// che /estrai-esami scrive nel frontmatter degli estratti (coerente con
// `fonte` nelle lezioni, anch'esso relativo alla materia, vedi
// CLAUDE.md) — è quello che permette il confronto diretto in
// esamiDaEstrarre(), sotto: senza questa coerenza il conteggio "da
// estrarre" non riconoscerebbe mai un estratto come già coperto.
function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name.startsWith('.')) continue;
    const full = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function esamiOriginali(slug) {
  const materiaDir = path.join(MATERIE_DIR, slug);
  const dir = path.join(materiaDir, '05-esami', 'originali');
  return walkFiles(dir).map((f) => path.relative(materiaDir, f).split(path.sep).join('/'));
}

// Originali senza un estratto corrispondente (confronto diretto sul
// percorso, stesso formato relativo alla materia in entrambi i lati —
// vedi nota su esamiOriginali). Centralizzata qui perché sia l'API sia
// eventuali script CLI devono contare allo stesso modo.
function esamiDaEstrarre(slug) {
  const fontiEstratte = new Set(esamiEstratti(slug).map((e) => e.fonte));
  return esamiOriginali(slug).filter((f) => !fontiEstratte.has(f));
}

// Estratti (frontmatter di 05-esami/estratti/*.md, scritti da /estrai-esami).
function esamiEstratti(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, '05-esami', 'estratti');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({ materia: slug, file: f, fonte: fm.fonte || null, esercizi: fm.esercizi ? parseInt(fm.esercizi, 10) : 0, dataEsame: fm.data_esame || null });
    }
  }
  return out;
}

// Consegne generate (frontmatter di 05-esami/generati/*-consegna.md,
// scritte da /simula-esame). Le soluzioni gemelle non servono a questa
// lista: restano nascoste finché non si lancia /correggi.
function esamiGenerati(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, '05-esami', 'generati');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('-consegna.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({ materia: slug, file: f, slug: f.replace(/-consegna\.md$/, ''), generato: fm.generato || null, punteggioTotale: fm.punteggio_totale || null });
    }
  }
  return out;
}

// Correzioni (frontmatter di 06-simulazioni/*.md, scritte da /correggi).
function simulazioni(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, '06-simulazioni');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({
        materia: slug,
        file: f,
        simulazione: fm.simulazione || null,
        data: fm.data || null,
        punteggio: fm.punteggio || null,
        punteggioTotale: fm.punteggio_totale || null,
      });
    }
  }
  return out;
}

// Elenco degli schemi (frontmatter di 07-schemi/*.md): sia quelli
// digitalizzati da foto (/digitalizza-schema) sia quelli scritti a mano
// libera nell'editor outline della dashboard (Fase 9 §A, vedi
// salvaSchemaOutline sotto) — stesso frontmatter per entrambi, cambia solo
// `fonte` (vedi CLAUDE.md).
function listSchemi(materiaFiltro) {
  const out = [];
  for (const slug of materiaFiltro ? [materiaFiltro] : listMaterie()) {
    const dir = path.join(MATERIE_DIR, slug, SCHEMI_DIR_NAME);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const fm = readFrontmatter(path.join(dir, f));
      out.push({
        materia: slug,
        file: f,
        titolo: fm.titolo || f,
        fonte: fm.fonte || null,
        concetti: fm.concetti || '',
        digitalizzato: fm.digitalizzato || null,
      });
    }
  }
  out.sort((a, b) => (b.digitalizzato || '').localeCompare(a.digitalizzato || ''));
  return out;
}

function slugifyTitolo(titolo) {
  const slug = titolo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'schema';
}

// Salva un outline scritto direttamente nell'editor della dashboard (non
// da una foto: quella via è /digitalizza-schema) in
// 07-schemi/<slug>.md, con lo stesso frontmatter documentato in
// CLAUDE.md — `fonte` è "digitazione diretta" invece del percorso a
// un'immagine. Gli ID concetto già presenti nel testo tra parentesi
// (stessa convenzione di /schematizza e /digitalizza-schema, es.
// "Data hazard (C-ARCH-0042)") popolano `concetti` automaticamente,
// senza che l'utente li ricopi a mano.
function salvaSchemaOutline(materia, { titolo, outline, oggi }) {
  if (!listMaterie().includes(materia)) throw new Error('materia non valida');
  if (!titolo || !titolo.trim()) throw new Error('titolo obbligatorio');
  if (!outline || !outline.trim()) throw new Error('outline vuoto');

  const dir = path.join(MATERIE_DIR, materia, SCHEMI_DIR_NAME);
  fs.mkdirSync(dir, { recursive: true });

  const concetti = [...new Set(outline.match(/C-[A-Z]+-\d{4}/g) || [])];
  const slug = slugifyTitolo(titolo);
  const frontmatter = [
    '---',
    `materia: ${materia}`,
    `titolo: ${titolo.trim()}`,
    'fonte: "digitazione diretta"',
    `concetti: [${concetti.join(', ')}]`,
    `digitalizzato: ${oggi}`,
    '---',
    '',
  ].join('\n');

  const file = `${slug}.md`;
  fs.writeFileSync(path.join(dir, file), frontmatter + outline.trim() + '\n', 'utf8');
  return { file, slug };
}

// Quanti elementi (foto, PDF, testo) attendono ancora /cattura in 00-inbox/,
// escludendo _processati/ e i file di servizio come .gitkeep.
function inboxDaProcessare(slug) {
  const dir = path.join(MATERIE_DIR, slug, '00-inbox');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile() && d.name !== '.gitkeep').length;
}

const SCHEMI_DIR_NAME = '07-schemi';

const SEZIONI_LEGGIBILI = {
  lezioni: '01-lezioni',
  concetti: '02-concetti',
  sintesi: '03-sintesi',
  'esami-estratti': path.join('05-esami', 'estratti'),
  'esami-generati': path.join('05-esami', 'generati'),
  simulazioni: '06-simulazioni',
  schemi: SCHEMI_DIR_NAME,
};

// Legge un file di una sezione del vault in modo sicuro per un endpoint
// HTTP: materia e sezione sono validate su whitelist, e il nome file deve
// combaciare *esattamente* con una voce reale di fs.readdirSync(dir) — non
// basta che "sembri" un nome file valido (niente `..`, niente path
// assoluti che aggirino il controllo): se non è nell'elenco reale della
// cartella, non viene letto. Usata da GET /api/contenuto.
function leggiContenuto(materia, sezione, file) {
  if (!listMaterie().includes(materia)) throw new Error('materia non valida');
  const cartella = SEZIONI_LEGGIBILI[sezione];
  if (!cartella) throw new Error('sezione non valida');
  const dir = path.join(MATERIE_DIR, materia, cartella);
  if (!fs.existsSync(dir)) throw new Error('sezione vuota');
  const reale = fs.readdirSync(dir).find((f) => f === file);
  if (!reale) throw new Error('file non trovato');
  return fs.readFileSync(path.join(dir, reale), 'utf8');
}

// Cartella 00-inbox/ di una materia, validata — usata dall'upload. Mai
// costruire il percorso di destinazione altrove con la materia grezza
// dalla request.
function inboxDir(materia) {
  if (!listMaterie().includes(materia)) throw new Error('materia non valida');
  const dir = path.join(MATERIE_DIR, materia, '00-inbox');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
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
  separaFrontmatter,
  flashcardFiles,
  parseDeck,
  setCardStato,
  deleteCard,
  allCards,
  listConcetti,
  listLezioni,
  listSintesi,
  esamiOriginali,
  esamiEstratti,
  esamiDaEstrarre,
  esamiGenerati,
  simulazioni,
  listSchemi,
  salvaSchemaOutline,
  inboxDaProcessare,
  leggiContenuto,
  inboxDir,
};
