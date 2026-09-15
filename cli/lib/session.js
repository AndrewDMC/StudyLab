'use strict';
// Costruzione della sessione di ripasso giornaliera: condivisa tra la CLI
// (cli/ripassa.js) e il server della web app (app/server), per non
// duplicare la logica di interleaving e di cap per materia.

const vault = require('./vault');

const CAP_NUOVE_DEFAULT = 15;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Interleaving: raggruppa per materia, poi pesca a rotazione una carta da
// ciascuna a turno — così le materie si alternano invece di procedere a
// blocchi, che è meno efficace per la ritenzione (vedi PIANO.md §3).
function interleave(cards) {
  const perMateria = {};
  for (const c of shuffle(cards)) {
    (perMateria[c.materia] = perMateria[c.materia] || []).push(c);
  }
  const materie = Object.keys(perMateria);
  const out = [];
  let rimaste = cards.length;
  while (rimaste > 0) {
    for (const m of materie) {
      const lista = perMateria[m];
      if (lista.length) {
        out.push(lista.shift());
        rimaste--;
      }
    }
  }
  return out;
}

function capPerMateria() {
  const out = {};
  for (const slug of vault.listMaterie()) {
    const info = vault.readMateriaYml(slug);
    out[slug] = Number.isInteger(info.carte_nuove_al_giorno) ? info.carte_nuove_al_giorno : CAP_NUOVE_DEFAULT;
  }
  return out;
}

// Costruisce la sessione del giorno per una materia (o per tutte, se
// omessa): carte dovute + carte nuove ammesse dal cap, mescolate per
// interleaving. Restituisce anche i conteggi grezzi, utili per una
// dashboard senza dover rifare il calcolo.
function costruisciSessione(srs, materiaFiltro) {
  const state = srs.loadState();
  let attive = vault.allCards({ soloStato: 'attiva' });
  if (materiaFiltro) attive = attive.filter((c) => c.materia === materiaFiltro);

  const cap = capPerMateria();
  const { dovute, nuove } = srs.carteDaRipassare(state, attive, cap);

  return {
    sessione: interleave([...dovute, ...nuove]),
    dovute: dovute.length,
    nuove: nuove.length,
    capPerMateria: cap,
  };
}

module.exports = { CAP_NUOVE_DEFAULT, shuffle, interleave, capPerMateria, costruisciSessione };
