# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Studenti universitari che vogliono trasformare le lezioni in ripasso attivo efficace. Utente attuale: Andrea de Amicis (studente di informatica/ingegneria, università italiana). Ambizione: qualsiasi studente, indipendentemente dalla materia o dall'ateneo.

Contesto d'uso: lo studente cattura il materiale a lezione (foto, trascrizioni), avvia la pipeline AI, studia in sessioni di ripasso brevi anche su mobile. La parte AI richiede connessione e credenziali Claude; il ripasso SM-2 funziona completamente offline.

## Product Purpose

StudyLab trasforma materiale grezzo di lezione in un vault di concetti atomici e flashcard, poi gestisce le ripetizioni spaziate (SM-2). Il flusso è:

**cattura → schematizza → flashcard → compattazione → esami → ripasso**

Ogni fase è attivabile dalla web app tramite la coda job (worker → Claude CLI). Il ripasso è codice deterministico: funziona senza AI. Il successo è misurato dalla copertura dei concetti con flashcard attive e dall'aumento del punteggio alle simulazioni d'esame.

## Positioning

L'unico sistema di studio che combina — in modo inseparabile — una pipeline AI (cattura→schematizza→flashcard) con il principio "mai inventare contenuto" e un vault portabile in Markdown che funziona anche a Claude spento.

Anki gestisce il ripasso, Notion accumula note: StudyLab fa le due cose insieme, partendo dal materiale grezzo e restando fedele alla lezione effettivamente tenuta.

## Operating Context

- Studente all'università; lezioni frequenti, esami a data fissa con countdown.
- Materiale in ingresso: foto di appunti, slide PDF, testo digitato.
- Pipeline AI azionata dalla web app (pulsanti su Materiali) o da CLI.
- Worker (`node cli/worker.js`) deve essere attivo perché i job vengano eseguiti.
- Revisione e ripasso sulla web app (Dashboard → Active Recall); esplorazione concetti su Concetti.
- Il vault è versionato con git; i file Markdown/YAML sono il prodotto, non un database.

## Capabilities and Constraints

**Skill AI disponibili:** `/cattura`, `/schematizza`, `/genera-flashcard`, `/compatta`, `/estrai-esami`, `/simula-esame`, `/correggi`, `/digitalizza-schema`

**Vincoli non negoziabili:**
- L'AI non inventa mai contenuto: i dubbi si marcano `❓ DA CHIARIRE`, non si riempiono.
- Gli ID concetto (`C-<MATERIA>-NNNN`) sono stabili una volta assegnati.
- `05-esami/originali/` è di sola lettura.
- `srs/state.json` è l'unico stato mutabile del sistema (SM-2).
- Il motore SM-2 e il parsing dei mazzi stanno in `cli/lib/*` — la web app non li riscrive.

**Stack:** React + Vite (frontend), Express (API su porta `API_PORT`), TypeScript, marked + KaTeX + markmap per il rendering dei contenuti. Deploy: Docker + docker-compose (servizio `web` + `worker`).

**Lingua UI:** attualmente italiano. Internazionalizzazione futura è una possibilità aperta; non è un vincolo definitivo.

## Brand Commitments

- **Nome:** StudyLab — definitivo.
- **Lingua contenuto:** italiano per il materiale di studio (termini tecnici in inglese se usati correntemente nella materia).
- Nessun logo o palette cromatica ufficialmente fissata al di fuori dell'implementazione esistente.

## Evidence on Hand

- Vault attivo per la materia `architettura` (architettura dei calcolatori), con lezioni, concetti (`C-ARCH-*`), flashcard, schemi e temi d'esame estratti.
- Web app funzionante con Dashboard (pipeline strip + heatmap confidenza + countdown esame), Materiali (upload + viewer + coda job), Active Recall (ripasso SM-2 + cura carte), Concetti (esplorazione per materia).
- Nessun dato utente reale da mostrare come prova a terzi: il vault è personale.

## Product Principles

1. **Il vault sopravvive all'AI.** Ogni concetto è un file Markdown leggibile; SM-2 è codice deterministico. Claude spento non blocca lo studio.
2. **Fedeltà al materiale.** I dubbi si marcano, non si inventano. La fonte è la lezione tenuta, non l'enciclopedia.
3. **Pipeline, non pila.** Lo studio è un flusso a fasi con stato visibile, non un cumulo di note senza struttura.
4. **L'AI accelera, lo studente impara.** Claude genera schemi e flashcard; è lo studente che approva, cura e studia.
5. **Portabilità.** Markdown + YAML + git: nessun vendor lock-in, nessuna dipendenza da database proprietari.
