---
name: digitalizza-schema
description: Legge una foto o scansione di uno schema disegnato a mano in 00-inbox/ e produce in 07-schemi/ la trascrizione AI-leggibile (outline Markdown + Mermaid se servono relazioni non gerarchiche), collegata agli ID dei concetti esistenti. Usare quando l'utente ha disegnato uno schema su carta o tablet e vuole renderlo leggibile dal sistema, senza perdere l'originale come proprio artefatto di studio.
---

# /digitalizza-schema

Prende **una** foto/scansione di uno schema disegnato a mano da
`00-inbox/` e produce in `07-schemi/`:

1. l'**originale**, spostato accanto alla trascrizione (non cancellato,
   non lasciato in `00-inbox/`);
2. la **trascrizione AI-leggibile**: outline Markdown gerarchico, più un
   blocco Mermaid se lo schema ha relazioni non gerarchiche (frecce
   trasversali, cicli, macchine a stati);
3. il **collegamento** agli ID dei concetti già esistenti in
   `02-concetti/` che lo schema tocca, e la segnalazione (non la
   creazione) di eventuali concetti nuovi.

Il disegno resta il *tuo* artefatto — quello che ti ha fatto capire mentre
lo facevi, e che riguarderai. Il `.md` è solo ciò che permette al sistema
di collegarlo a flashcard, compattazioni e interrogazioni (vedi
PIANO.md §9).

## Argomenti

`/digitalizza-schema <materia> <file>`

- `file` è **obbligatorio** (a differenza di `/cattura`): `00-inbox/`
  contiene sia catture di lezioni sia foto di schemi, e non c'è modo di
  distinguerle a colpo d'occhio. Se manca, elenca i file immagine trovati
  in `00-inbox/` per quella materia e chiedi quale processare — non
  indovinare, e non processarli tutti in blocco.
- Se il file indicato non è un'immagine (foto, scan, screenshot/export di
  un canvas), fermati e segnalalo: questa skill non processa PDF di slide
  né testo, quella è `/cattura`.

## Procedura

### 1. Prepara il contesto

- Leggi `materie/<materia>/materia.yml` (prefisso ID).
- Leggi **tutte** le note in `02-concetti/` della materia (solo
  frontmatter: id, titolo, tag) per sapere a cosa collegare lo schema.
- Leggi anche i nomi già presenti in `07-schemi/` per evitare collisioni
  di slug.

### 2. Leggi l'immagine

Leggila **direttamente**, senza OCR — su schizzi e scrittura a mano libera
funziona molto meglio di un OCR classico. Trascrivi fedelmente ciò che è
disegnato: non correggere la logica dell'autore, non completare un nodo
lasciato a metà con la tua conoscenza generale della materia. Se un nodo,
una freccia o un'etichetta non si legge, marcalo `> ❓ DA CHIARIRE: <cosa>`
esattamente come da regola 1 in [CLAUDE.md](../../CLAUDE.md) — mai
indovinare cosa c'era scritto.

### 3. Costruisci la trascrizione

- Se lo schema è una gerarchia (albero, elenco di categorie e
  sottocategorie) → outline Markdown puntato, 2-3 livelli.
- Se ha relazioni trasversali (frecce che saltano tra rami, cicli, stati)
  → aggiungi anche un blocco Mermaid. Non forzare in un albero ciò che è
  un grafo, e non forzare in Mermaid ciò che è solo una gerarchia: usa
  l'outline come base di default, il Mermaid solo per ciò che l'outline
  non può esprimere.
- Per ogni nodo che corrisponde a un concetto già esistente in
  `02-concetti/`, aggiungi l'ID tra parentesi accanto al nodo (stesso
  stile usato da `/schematizza`, es. `- Data hazard (C-ARCH-0042)`).
- Per ogni nodo che sembra un concetto nuovo (non presente in
  `02-concetti/` ma abbastanza specifico da meritare una nota a sé),
  **non crearlo**: elencalo in coda al file sotto `## Concetti nuovi da
  valutare`, così l'utente sa cosa passare a `/schematizza` in seguito.

### 4. Scrivi i file in `07-schemi/`

- Sposta l'originale da `00-inbox/` a
  `materie/<materia>/07-schemi/<slug>.<estensione-originale>`.
- Scrivi `materie/<materia>/07-schemi/<slug>.md` con il frontmatter
  definito in [CLAUDE.md](../../CLAUDE.md) (`materia`, `titolo`, `fonte`,
  `concetti`, `digitalizzato`).
- `<slug>` deriva dal titolo dello schema (dedotto dal contenuto, o
  chiesto all'utente se non è deducibile) — stesso slug per entrambi i
  file, così restano visibilmente accoppiati.

### 5. Riepilogo finale

Riporta: il file creato, quanti concetti esistenti collegati (con ID),
l'elenco di eventuali concetti nuovi segnalati (non creati), e ogni
`❓ DA CHIARIRE` lasciato in sospeso.

## Cosa non fare

- Non creare o modificare note in `02-concetti/`: questa skill collega,
  non genera concetti (compito di `/schematizza`).
- Non generare flashcard qui.
- Non processare più di uno schema per invocazione: un file, un output —
  se l'utente ha più schemi da digitalizzare, va invocata più volte.
- Non processare `risorse/` né PDF/testo: solo immagini da `00-inbox/`.
