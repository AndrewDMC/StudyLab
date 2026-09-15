'use strict';
// Coda dei job su filesystem — il meccanismo con cui la web app chiede
// lavoro a Claude senza mai bloccarsi su una chiamata AI sincrona (vedi
// PIANO.md §0 e §8: "l'AI è un processo batch che tu lanci, mai una
// dipendenza runtime dell'applicazione"). Questo modulo gestisce solo la
// coda (enqueue/lista/spostamento tra stati); l'esecuzione vera dei job è
// in cli/worker.js, un processo separato che l'utente avvia esplicitamente.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vault = require('./vault');
const { VAULT_ROOT } = vault;

const JOBS_DIR = path.join(VAULT_ROOT, '_jobs'); // vedi .gitignore: non versionato, è stato runtime
const STATI = ['queue', 'running', 'done', 'failed'];

// Il prompt finisce come argomento a un processo `claude` reale (vedi
// worker.js), lanciato con shell:true su Windows per risolvere claude.cmd.
// Per questo ogni valore che entra nel prompt è validato con una whitelist
// di caratteri stretta *prima* di essere interpolato — mai fidarsi che
// l'escaping dello shell basti da solo (vedi CLAUDE.md, nota di sicurezza).
const RE_SLUG = /^[a-z0-9-]+$/;
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;

function validaMateria(materia) {
  if (!RE_SLUG.test(materia || '') || !vault.listMaterie().includes(materia)) {
    throw new Error(`materia non valida: ${materia}`);
  }
  return materia;
}

function validaData(data) {
  if (!RE_DATA.test(data || '')) throw new Error(`data non valida (attesa AAAA-MM-GG): ${data}`);
  return data;
}

function validaArgomento(argomento) {
  if (argomento === undefined || argomento === null || argomento === '') return null;
  if (!RE_SLUG.test(argomento) && !/^C-[A-Z0-9-]+$/.test(argomento)) {
    throw new Error(`argomento non valido: ${argomento}`);
  }
  return argomento;
}

function ensureDirs() {
  for (const s of STATI) fs.mkdirSync(path.join(JOBS_DIR, s), { recursive: true });
}

// Le skill invocabili dalla UI e come tradurle in un comando /slash per
// Claude Code. Whitelist esplicita: la web app non deve poter costruire un
// prompt arbitrario, solo invocare skill note con argomenti noti (vedi
// nota di sicurezza in CLAUDE.md).
const SKILL_COMANDI = {
  cattura: (args) => `/cattura ${validaMateria(args.materia)}`,
  schematizza: (args) => `/schematizza ${validaMateria(args.materia)} ${validaData(args.data)}`,
  'genera-flashcard': (args) => {
    const materia = validaMateria(args.materia);
    const argomento = validaArgomento(args.argomento);
    return `/genera-flashcard ${materia}${argomento ? ` ${argomento}` : ''}`;
  },
};

function costruisciPrompt(skill, args) {
  const f = SKILL_COMANDI[skill];
  if (!f) throw new Error(`skill non riconosciuta: ${skill}`);
  return f(args || {});
}

function enqueue(skill, args) {
  ensureDirs();
  costruisciPrompt(skill, args); // valida skill+args prima di accodare
  const id = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const job = { id, skill, args: args || {}, stato: 'queue', creato: new Date().toISOString() };
  fs.writeFileSync(path.join(JOBS_DIR, 'queue', `${id}.json`), JSON.stringify(job, null, 2));
  return job;
}

function leggiJob(stato, id) {
  const file = path.join(JOBS_DIR, stato, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listJobs({ limit = 50 } = {}) {
  ensureDirs();
  const out = [];
  for (const stato of STATI) {
    const dir = path.join(JOBS_DIR, stato);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
      } catch {
        // job scritto a metà (raro, solo in caso di crash a metà write): ignoralo
      }
    }
  }
  out.sort((a, b) => (b.creato || '').localeCompare(a.creato || ''));
  return out.slice(0, limit);
}

// Prende il job più vecchio in coda e lo sposta in "running". Ritorna
// null se la coda è vuota. Usata solo dal worker (cli/worker.js), mai
// dal server della web app — il server accoda, non esegue.
function prendiProssimo() {
  ensureDirs();
  const dirQueue = path.join(JOBS_DIR, 'queue');
  const file = fs
    .readdirSync(dirQueue)
    .filter((f) => f.endsWith('.json'))
    .sort()[0]; // nome file = timestamp: il più vecchio ordina per primo
  if (!file) return null;
  const job = JSON.parse(fs.readFileSync(path.join(dirQueue, file), 'utf8'));
  job.stato = 'running';
  job.iniziato = new Date().toISOString();
  fs.writeFileSync(path.join(JOBS_DIR, 'running', file), JSON.stringify(job, null, 2));
  fs.unlinkSync(path.join(dirQueue, file));
  return { ...job, _file: file };
}

function concludi(file, statoFinale, extra) {
  const src = path.join(JOBS_DIR, 'running', file);
  const job = JSON.parse(fs.readFileSync(src, 'utf8'));
  Object.assign(job, extra, { stato: statoFinale, finito: new Date().toISOString() });
  fs.writeFileSync(path.join(JOBS_DIR, statoFinale, file), JSON.stringify(job, null, 2));
  fs.unlinkSync(src);
  return job;
}

module.exports = { JOBS_DIR, SKILL_COMANDI, costruisciPrompt, enqueue, leggiJob, listJobs, prendiProssimo, concludi };
