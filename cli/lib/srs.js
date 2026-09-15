'use strict';
// Motore di ripetizione spaziata: SM-2 nella variante a 4 valutazioni
// (Again/Hard/Good/Easy) usata anche da Anki — a granularità di giorni,
// adatta a una sessione quotidiana e non a ripassi infragiornalieri.
// Deterministico, senza AI: vedi PIANO.md §3.

const fs = require('fs');
const path = require('path');
const { VAULT_ROOT } = require('./vault');

const STATE_FILE = path.join(VAULT_ROOT, 'srs', 'state.json');
const EASE_MIN = 1.3;
const EASE_DEFAULT = 2.5;

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Attenzione: toISOString() converte in UTC. Con fuso orario positivo
// (es. CEST, UTC+2), la mezzanotte locale corrisponde alle 22:00 del
// giorno *precedente* in UTC — passando da lì si ottiene sempre una data
// indietro di un giorno. Qui si lavora solo con i getter locali (getDate,
// getMonth, getFullYear) e mai con toISOString(), per restare coerenti con
// il fuso dell'utente a grana giornaliera.
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(dateStr, n) {
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { versione: 1, algoritmo: 'sm2', carte: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function nuovaCarta(materia, concetto) {
  return {
    materia,
    concetto,
    interval: 0,
    ease: EASE_DEFAULT,
    reps: 0,
    lapses: 0,
    due: today(),
    ultima_revisione: null,
  };
}

// voto: 1 = again, 2 = hard, 3 = good, 4 = easy
function valuta(carta, voto) {
  const c = { ...carta };
  const t = today();

  if (voto === 1) {
    c.lapses += 1;
    c.reps = 0;
    c.interval = 1;
    c.ease = Math.max(EASE_MIN, c.ease - 0.2);
  } else if (voto === 2) {
    c.interval = Math.max(1, Math.round((c.interval || 1) * 1.2));
    c.ease = Math.max(EASE_MIN, c.ease - 0.15);
    c.reps += 1;
  } else if (voto === 3) {
    if (c.reps === 0) c.interval = 1;
    else if (c.reps === 1) c.interval = 6;
    else c.interval = Math.round(c.interval * c.ease);
    c.reps += 1;
  } else if (voto === 4) {
    if (c.reps === 0) c.interval = 4;
    else c.interval = Math.round(c.interval * c.ease * 1.3);
    c.ease = c.ease + 0.15;
    c.reps += 1;
  } else {
    throw new Error(`voto non valido: ${voto} (atteso 1-4)`);
  }

  c.due = addDays(t, c.interval);
  c.ultima_revisione = t;
  return c;
}

// Restituisce le carte dovute oggi, applicando il cap giornaliero di carte
// nuove per materia (le carte già introdotte e dovute non hanno cap: si
// ripassano sempre). `cardsInfo` è l'elenco di { srsId, materia, concetto }
// letto dal vault (fonte di verità sui mazzi correnti).
function carteDaRipassare(state, cardsInfo, capNuoveCarte) {
  const t = today();
  const nuoveIntrodotteOggiPerMateria = {};

  // Le carte già in stato riviste oggi come "nuove" contano nel cap anche
  // se la sessione viene interrotta e ripresa lo stesso giorno.
  for (const c of Object.values(state.carte)) {
    if (c.ultima_revisione === t && c.reps <= 1 && c.lapses === 0) {
      nuoveIntrodotteOggiPerMateria[c.materia] = (nuoveIntrodotteOggiPerMateria[c.materia] || 0) + 1;
    }
  }

  const dovute = [];
  const nuove = [];

  for (const info of cardsInfo) {
    const esistente = state.carte[info.srsId];
    if (!esistente) {
      nuove.push(info);
      continue;
    }
    if (esistente.due <= t) dovute.push(info);
  }

  const cap = { ...nuoveIntrodotteOggiPerMateria };
  const nuoveAmmesse = [];
  for (const info of nuove) {
    const used = cap[info.materia] || 0;
    if (used >= capNuoveCarte) continue;
    cap[info.materia] = used + 1;
    nuoveAmmesse.push(info);
  }

  return { dovute, nuove: nuoveAmmesse };
}

module.exports = { STATE_FILE, loadState, saveState, nuovaCarta, valuta, carteDaRipassare, today };
