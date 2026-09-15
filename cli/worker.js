#!/usr/bin/env node
'use strict';
// Worker della coda job: l'UNICO punto del sistema che invoca davvero
// Claude Code. Va avviato esplicitamente dall'utente in un terminale
// separato — mai dal server della web app (vedi PIANO.md §0): l'AI resta
// un processo batch che l'utente sceglie di lanciare, non una dipendenza
// runtime nascosta dietro un click.
//
// Uso:  node cli/worker.js
//
// Concorrenza 1 per design (vedi PIANO.md §8): il rate limit dell'
// abbonamento è dell'account, non della macchina — due job in parallelo
// competono sulla stessa finestra. Un job alla volta, in ordine di arrivo.

const { spawn } = require('child_process');
const jobs = require('./lib/jobs');
const { VAULT_ROOT } = require('./lib/vault');

const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude'; // override nei test, vedi CLAUDE.md
const POLL_MS = 3000;

function eseguiJob(job) {
  return new Promise((resolve) => {
    let prompt;
    try {
      prompt = jobs.costruisciPrompt(job.skill, job.args);
    } catch (e) {
      return resolve({ ok: false, errore: e.message, output: '' });
    }

    console.log(`[worker] eseguo job ${job.id}: ${prompt}`);
    // shell:true serve solo su Windows per risolvere claude.cmd; altrove
    // (server Ubuntu, §8) claude è un binario diretto e non serve — e ogni
    // shell in più è superficie d'attacco in meno da tenere. Gli argomenti
    // sono comunque validati a monte in jobs.js (whitelist di caratteri),
    // mai fidarsi del solo escaping dello shell.
    const proc = spawn(
      CLAUDE_BIN,
      ['-p', prompt, '--permission-mode', 'acceptEdits', '--allowed-tools', 'Read,Write,Edit,Glob,Grep'],
      { cwd: VAULT_ROOT, shell: process.platform === 'win32' }
    );

    let output = '';
    proc.stdout.on('data', (d) => {
      output += d.toString();
      process.stdout.write(d);
    });
    proc.stderr.on('data', (d) => {
      output += d.toString();
      process.stderr.write(d);
    });
    proc.on('close', (code) => resolve({ ok: code === 0, output, codiceUscita: code }));
    proc.on('error', (err) => resolve({ ok: false, errore: err.message, output }));
  });
}

async function ciclo() {
  const job = jobs.prendiProssimo();
  if (!job) return;

  const risultato = await eseguiJob(job);
  if (risultato.ok) {
    jobs.concludi(job._file, 'done', { output: risultato.output.slice(-4000) });
    console.log(`[worker] job ${job.id} completato`);
  } else {
    jobs.concludi(job._file, 'failed', {
      output: (risultato.output || '').slice(-4000),
      errore: risultato.errore || `uscito con codice ${risultato.codiceUscita}`,
    });
    console.log(`[worker] job ${job.id} fallito: ${risultato.errore || risultato.codiceUscita}`);
  }
}

async function main() {
  console.log(`[worker] avviato — vault: ${VAULT_ROOT}`);
  console.log(`[worker] in ascolto su ${jobs.JOBS_DIR} (poll ogni ${POLL_MS / 1000}s, concorrenza 1)`);
  // Loop sequenziale, mai in parallelo: un job alla volta anche se la coda
  // ne accumula molti (vedi commento sulla concorrenza in testa al file).
  for (;;) {
    await ciclo();
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

main();
