#!/usr/bin/env node
'use strict';
// CLI minimale di ripasso e curazione — Fase 3 del piano (vedi PIANO.md §3).
// Zero dipendenze esterne: solo readline, per poter girare ovunque ci sia
// Node, prima ancora che esista la web app (Fase 4).
//
// Uso:
//   node cli/ripassa.js studia [materia]   ripassa le carte dovute oggi
//   node cli/ripassa.js cura [materia]     approva/scarta le carte "proposta"
//   node cli/ripassa.js stato              riepilogo rapido, nessuna interazione

const readline = require('readline');
const vault = require('./lib/vault');
const srs = require('./lib/srs');

const CAP_NUOVE_DEFAULT = 15;

// Wrapper su readline come async iterator di righe, invece di rl.question()
// ripetuto: con stdin non interattivo (file/pipe, come nei test o in un
// batch da script) rl.question() chiamato più volte di seguito perde righe
// e il processo esce in silenzio. L'iterazione asincrona sulle righe è
// robusta sia da terminale vero sia da input redirezionato.
function createPrompter(rl) {
  const it = rl[Symbol.asyncIterator]();
  return async function ask(promptText) {
    process.stdout.write(promptText);
    const { value, done } = await it.next();
    return done ? null : value; // null = EOF, trattato come "esci"
  };
}

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
  const code = Object.keys(perMateria);
  const out = [];
  let rimaste = cards.length;
  while (rimaste > 0) {
    for (const m of code) {
      const lista = perMateria[m];
      if (lista.length) {
        out.push(lista.shift());
        rimaste--;
      }
    }
  }
  return out;
}

async function cmdStudia(materiaFiltro) {
  const state = srs.loadState();
  let attive = vault.allCards({ soloStato: 'attiva' });
  if (materiaFiltro) attive = attive.filter((c) => c.materia === materiaFiltro);

  if (attive.length === 0) {
    console.log(
      'Nessuna carta "attiva" da ripassare.\n' +
        'Le carte generate da /genera-flashcard nascono "proposta": curale prima con:\n' +
        '  node cli/ripassa.js cura' + (materiaFiltro ? ` ${materiaFiltro}` : '')
    );
    return;
  }

  const capPerMateria = {};
  for (const slug of vault.listMaterie()) {
    const info = vault.readMateriaYml(slug);
    capPerMateria[slug] = Number.isInteger(info.carte_nuove_al_giorno)
      ? info.carte_nuove_al_giorno
      : CAP_NUOVE_DEFAULT;
  }
  // Usa il cap più permissivo tra le materie coinvolte per la selezione
  // globale; il cap effettivo per materia è comunque rispettato dentro
  // carteDaRipassare grazie al campo `materia` di ogni carta.
  const capMax = Math.max(...Object.values(capPerMateria), CAP_NUOVE_DEFAULT);
  const { dovute, nuove } = srs.carteDaRipassare(state, attive, capMax);

  const sessione = interleave([...dovute, ...nuove]);
  if (sessione.length === 0) {
    console.log('Tutto ripassato per oggi. 🎉');
    return;
  }

  console.log(
    `Sessione: ${dovute.length} da ripassare, ${nuove.length} nuove (cap ${capMax}/materia/giorno).\n` +
      'Invio per rivelare la risposta, poi 1=again 2=hard 3=good 4=easy, s=sospendi, q=esci.\n'
  );

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = createPrompter(rl);
  let fatte = 0;

  for (const info of sessione) {
    console.log(`\n[${info.materiaNome}] ${info.concetto}`);
    console.log(info.domanda);
    const invio = await ask('  (Invio per la risposta) ');
    if (invio === null) break; // EOF: esci come con 'q'
    console.log(`> ${info.risposta}`);

    let voto = null;
    while (voto === null) {
      const rispRaw = await ask('  valutazione [1-4 / s / q]: ');
      if (rispRaw === null) {
        voto = 'quit';
        break;
      }
      const risp = rispRaw.trim().toLowerCase();
      if (risp === 'q') {
        rl.close();
        srs.saveState(state);
        console.log(`\nSessione interrotta. ${fatte} carte ripassate, progressi salvati.`);
        return;
      }
      if (risp === 's') {
        vault.setCardStato(info.srsId, 'sospesa');
        console.log('  Carta sospesa: non riapparirà finché non la riattivi a mano.');
        voto = 'skip';
        continue;
      }
      if (['1', '2', '3', '4'].includes(risp)) {
        voto = parseInt(risp, 10);
      } else {
        console.log('  Input non valido.');
      }
    }

    if (voto === 'quit') break; // EOF a metà valutazione: esci senza contare questa carta
    if (voto !== 'skip') {
      const esistente = state.carte[info.srsId] || srs.nuovaCarta(info.materia, info.concetto);
      state.carte[info.srsId] = srs.valuta(esistente, voto);
      fatte++;
    }
  }

  rl.close();
  srs.saveState(state);
  console.log(`\nSessione completata: ${fatte} carte ripassate.`);
}

async function cmdCura(materiaFiltro) {
  let proposte = vault.allCards({ soloStato: 'proposta' });
  if (materiaFiltro) proposte = proposte.filter((c) => c.materia === materiaFiltro);

  if (proposte.length === 0) {
    console.log('Nessuna carta in attesa di curazione.');
    return;
  }

  console.log(
    `${proposte.length} carte da curare. Per ciascuna: a=approva, s=scarta, ` +
      'Invio=salta per ora, q=esci.\n'
  );

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = createPrompter(rl);
  let approvate = 0;
  let scartate = 0;

  for (const c of proposte) {
    console.log(`\n[${c.materiaNome}] ${c.concetto}`);
    console.log(`D: ${c.domanda}`);
    console.log(`R: ${c.risposta}`);
    const rispRaw = await ask('  [a/s/Invio/q] ');
    if (rispRaw === null) break; // EOF: come 'q'
    const risp = rispRaw.trim().toLowerCase();
    if (risp === 'q') break;
    if (risp === 'a') {
      vault.setCardStato(c.srsId, 'attiva');
      approvate++;
    } else if (risp === 's') {
      vault.deleteCard(c.srsId);
      scartate++;
    }
  }

  rl.close();
  console.log(`\nCurazione: ${approvate} approvate, ${scartate} scartate.`);
}

function cmdStato() {
  const state = srs.loadState();
  const t = srs.today();
  for (const slug of vault.listMaterie()) {
    const info = vault.readMateriaYml(slug);
    const carte = vault.allCards().filter((c) => c.materia === slug);
    const proposta = carte.filter((c) => c.stato === 'proposta').length;
    const attiva = carte.filter((c) => c.stato === 'attiva').length;
    const sospesa = carte.filter((c) => c.stato === 'sospesa').length;
    const dovute = carte.filter((c) => c.stato === 'attiva' && state.carte[c.srsId] && state.carte[c.srsId].due <= t)
      .length;
    const nuove = carte.filter((c) => c.stato === 'attiva' && !state.carte[c.srsId]).length;
    console.log(
      `${info.nome || slug}: ${attiva} attive (${dovute} dovute oggi, ${nuove} nuove), ` +
        `${proposta} da curare, ${sospesa} sospese`
    );
  }
}

async function main() {
  const [, , cmd, arg] = process.argv;
  if (cmd === 'studia') await cmdStudia(arg);
  else if (cmd === 'cura') await cmdCura(arg);
  else if (cmd === 'stato') cmdStato();
  else {
    console.log(
      'Uso:\n' +
        '  node cli/ripassa.js studia [materia]\n' +
        '  node cli/ripassa.js cura [materia]\n' +
        '  node cli/ripassa.js stato'
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
