# StudyLab — istruzioni per Claude

Questo repository è un **vault di studio**: appunti, schemi, flashcard e
materiale d'esame per l'utente, organizzati per materia. Non è un progetto
software nel senso classico — i file Markdown/YAML *sono* il prodotto.
Il piano completo è in [PIANO.md](PIANO.md); questo file è la guida operativa
per le skill.

## Struttura

```
materie/<materia>/
├── materia.yml       # metadati della materia
├── 00-inbox/         # cattura grezza non processata (foto, trascrizioni)
├── 01-lezioni/       # 1 file per lezione, appunti puliti
├── 02-concetti/      # note atomiche, 1 concetto = 1 file = 1 ID stabile
├── 03-sintesi/       # compattazioni settimanali/mensili
├── 04-flashcard/     # mazzi di flashcard, un file per argomento
├── 05-esami/
│   ├── originali/    # PDF/scan dei temi d'esame passati (immutabili)
│   ├── estratti/     # esercizi strutturati estratti dai PDF
│   └── generati/     # varianti nuove generate da Claude
└── 06-simulazioni/   # tentativi dell'utente + correzioni
```

`srs/state.json` è l'unico stato "vivo" del sistema (ripetizione spaziata),
gestito dall'app — non toccarlo dalle skill di contenuto.

## Regole non negoziabili

1. **Mai inventare contenuto.** Se qualcosa negli appunti/slide è ambiguo o
   illeggibile, marcalo `> ❓ DA CHIARIRE: <cosa>` invece di riempire il buco
   con la tua conoscenza generale. Il materiale fa fede sulla lezione
   *effettivamente tenuta*, non su come l'argomento è trattato altrove.
2. **`05-esami/originali/` è di sola lettura.** Non modificare né rinominare
   mai questi file: sono la fonte primaria per l'estrazione degli esercizi.
3. **Ogni concetto nuovo riceve un ID** nel formato `C-<MATERIA>-NNNN`
   (es. `C-ARCH-0042`), a 4 cifre, progressivo per materia. Prima di crearne
   uno nuovo, cerca in `02-concetti/` se il concetto esiste già sotto altro
   nome — collega, non duplicare.
4. **Non generare flashcard durante `/schematizza`.** È una fase separata
   (`/genera-flashcard`, Fase 3), volutamente disaccoppiata: la
   rielaborazione a distanza di 24-48h dalla lezione è più efficace.
5. **Scrivi sempre in italiano**, salvo termini tecnici che nella materia si
   usano correntemente in inglese (es. "hazard", "forwarding").
6. **Non processare mai `risorse/`** salvo che un comando lo chieda
   esplicitamente: è materiale sorgente voluminoso (slide, PDF), non appunti.

## Frontmatter degli appunti-lezione (`01-lezioni/*.md`)

```yaml
---
materia: architettura
data: 2026-09-15
titolo: Hazard nella pipeline
fonte: 00-inbox/2026-09-15-foto1.jpg   # o "digitazione diretta"
stato: grezzo   # grezzo | schematizzato
---
```

## Frontmatter delle note-concetto (`02-concetti/*.md`)

```yaml
---
id: C-ARCH-0042
titolo: Data hazard RAW
materia: architettura
tipo: concetto        # concetto | definizione | procedura | dimostrazione
lezione: 2026-09-15   # data della lezione di prima comparsa
prerequisiti: [C-ARCH-0038, C-ARCH-0040]
confidenza: 0          # 0-5, aggiornata solo dal testing (Fase 5), non qui
tag: [pipeline, hazard]
stato: attivo          # bozza | attivo | archiviato
---

Corpo della nota: spiegazione concisa, in stile appunto, non enciclopedico.
```

Nomina il file `C-ARCH-0042-data-hazard-raw.md` (id + slug del titolo).

## Formato dei mazzi di flashcard (`04-flashcard/*.md`)

Un file per argomento, con un piccolo frontmatter e una carta per blocco:

```markdown
---
materia: architettura
argomento: pipeline-hazard
---

## [C-ARCH-0042] Cosa distingue un hazard RAW da un WAR?
?
RAW = dipendenza vera (lettura dopo scrittura), non eliminabile con renaming.
WAR = dipendenza di nome, eliminabile con register renaming.
<!-- srs: 4f2a1b -->
<!-- stato: proposta -->
```

- `[C-XXX-NNNN]` nella domanda collega la carta al concetto sorgente.
- `<!-- srs: xxxxxx -->` è la chiave primaria della carta (6 esadecimali
  minuscoli, univoca nel vault): resta stabile anche se il testo cambia,
  ed è ciò che `srs/state.json` referenzia per lo storico delle ripetizioni.
- `<!-- stato: proposta -->` finché l'utente non cura il mazzo; solo allora
  diventa `attiva` ed entra nella rotazione dell'app di ripasso.

## Convenzioni di naming

- Lezioni: `AAAA-MM-GG-slug-argomento.md`
- Concetti: `C-<MATERIA3>-NNNN-slug.md` (MATERIA3 = prime lettere della
  materia: `ARCH`, `MAT`, …; definito in `materia.yml`)
- Sintesi: `settimana-AAAA-Www.md`, `mensile-AAAA-MM.md`

## Skill disponibili

- `/cattura` — ingerisce ciò che è in `00-inbox/` e produce appunti puliti
  in `01-lezioni/`, senza schematizzare.
- `/schematizza <materia> <data-lezione>` — prende una lezione grezza e
  produce lo schema gerarchico + le note-concetto, collegando ai concetti
  esistenti.
- `/genera-flashcard <materia> [argomento|ID]` — genera carte di active
  recall dai concetti `attivo` non ancora coperti, in `stato: proposta` in
  attesa di curazione. Non generare mai per concetti `stato: bozza`.
- `/digitalizza-schema` — (Fase 9, non ancora implementata) converte uno
  schema disegnato a mano in outline Markdown + Mermaid.

Quando in dubbio su un formato o una regola non coperta qui, **fermati e
chiedi** invece di improvvisare una convenzione: questo file va aggiornato,
non aggirato.

## CLI di ripasso (`cli/ripassa.js`)

Non è una skill: è codice deterministico (motore SM-2), senza AI, pensato
per funzionare anche a Claude spento (vedi principio in PIANO.md §0). Non
va invocata dalle skill — è per l'utente, da terminale:

```
node cli/ripassa.js stato              # riepilogo per materia, nessuna interazione
node cli/ripassa.js cura [materia]     # approva/scarta le carte "proposta"
node cli/ripassa.js studia [materia]   # sessione di ripasso, interleaved tra materie
```

Legge/scrive `srs/state.json` (unico stato mutabile) e `04-flashcard/*.md`
(per cambiare `stato` da `proposta`/`attiva` a `sospesa`, o rimuovere una
carta scartata in curazione). Non tocca mai `02-concetti/` né `01-lezioni/`.

## Web app (`app/`)

Fase 4 del piano: stessa logica della CLI, interfaccia vera. Anche questa
**non è una skill** e non va invocata dalle skill — gira senza AI, riusa
`cli/lib/*` come unica fonte di verità (SM-2, parsing dei mazzi,
costruzione della sessione), non la riscrive.

```
app/
├── server/index.js   # API Express: legge/scrive il vault via cli/lib/*
└── src/pages/
    ├── Dashboard.tsx      # hub: stato di OGNI fase per materia + scorciatoie
    ├── Materiali.tsx      # carica file, visualizza lezioni in Markdown, aziona le skill
    ├── ActiveRecall.tsx   # Ripasso e Cura unificati, due tab della stessa sezione
    └── Concetti.tsx       # esplorazione per materia, non un dump tabellare
```

La Dashboard non è solo lo stato delle flashcard: mostra una "pipeline
strip" con tutte le fasi del piano (cattura, schematizza, flashcard, più i
segnaposto per compattazione ed esami quando non ancora implementate — vedi
`/api/pipeline`), così lo studente vede in un colpo d'occhio cosa può fare e
cosa deve fare, non solo la coda di ripasso del giorno.

Ripasso e Cura sono **la stessa sezione** (Active Recall), non due
schermate separate: sono due momenti dello stesso ciclo (curare le proposte
di `/genera-flashcard`, poi ripassarle), selezionabili con un tab
`?tab=ripassa|cura` e un filtro materia `?materia=slug` nell'URL — la
Dashboard vi linka già con i parametri giusti precompilati.

Sviluppo: `npm install && npm run dev` dentro `app/` (avvia API su :8081 e
Vite su :5173 insieme, via `concurrently`). Produzione: `npm run build &&
npm start` — un solo processo Express che serve sia l'API sia il build
statico (questo è il servizio `web` del container in PIANO.md §8).

Il server usa `API_PORT` (non `PORT`) per la propria porta: `PORT` è
riservato al processo che un eventuale tool di dev/preview considera
"principale" (qui: Vite) e non va condiviso tra i due processi lanciati da
`concurrently`, altrimenti collidono sulla stessa porta.

## Materiali: upload, viewer, e come la web app aziona le skill

`Materiali.tsx` è la "sezione di inserimento + visualizzazione" per
materia: carica file in `00-inbox/` (`POST /api/upload`), mostra le
lezioni renderizzate in Markdown vero — non solo le flashcard —
(`GET /api/contenuto`, con **KaTeX** per le formule), e ha i pulsanti per
far girare `/cattura`, `/schematizza`, `/genera-flashcard` sul materiale.

**Come funziona il trigger delle skill, ed è importante capirlo bene:**
il server (`app/server/index.js`) **non invoca mai Claude**. `POST
/api/job` scrive solo un file JSON in `_jobs/queue/` (vedi
`cli/lib/jobs.js`) — esattamente il meccanismo a coda descritto in
PIANO.md §8, qui implementato per l'uso locale prima ancora del deploy in
container. Chi esegue davvero il job è **`cli/worker.js`**, un processo
**separato che l'utente avvia esplicitamente**:

```
node cli/worker.js
```

Il worker fa polling della coda (ogni 3s, **concorrenza 1** — mai job in
parallelo, il rate limit è dell'account) e per ognuno spawna un vero
`claude -p "/<skill> <args>" --permission-mode acceptEdits --allowed-tools
Read,Write,Edit,Glob,Grep` nella root del vault. Senza il worker attivo, i
pulsanti della UI accodano job che restano in `queue` finché non parte.

**Nota di sicurezza**, perché qui il prompt passato a `claude` è costruito
da input che arriva da una request HTTP: `cli/lib/jobs.js` valida ogni
argomento con una whitelist di caratteri stretta (`materia` deve essere
uno slug esistente in `materie/`, `data` deve combaciare `AAAA-MM-GG`)
*prima* di costruire il prompt — mai fidarsi del solo escaping dello shell.
Le skill invocabili sono una whitelist esplicita (`SKILL_COMANDI`), non un
prompt libero: se serve una nuova skill accodabile dalla UI, va aggiunta lì
esplicitamente, non generalizzata a "qualunque comando".

`GET /api/contenuto` (usato dal viewer) ha la stessa cautela sui percorsi:
il nome file richiesto deve combaciare esattamente con una voce reale di
`fs.readdirSync()` sulla cartella della materia — non basta "sembrare" un
percorso valido, previene path traversal anche senza sanitizzazione manuale
della stringa.
