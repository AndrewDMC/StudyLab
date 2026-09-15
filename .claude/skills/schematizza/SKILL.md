---
name: schematizza
description: Trasforma una lezione grezza in 01-lezioni/ in uno schema gerarchico e in note-concetto atomiche in 02-concetti/, con ID e collegamenti ai concetti esistenti. Usare dopo /cattura, quando gli appunti puliti di una lezione sono pronti per essere schematizzati.
---

# /schematizza

Prende una lezione già catturata (`stato: grezzo`) e produce:

1. uno schema gerarchico in coda al file di lezione;
2. una nota-concetto per ogni concetto nuovo, in `02-concetti/`;
3. i collegamenti (`prerequisiti`) ai concetti già esistenti.

## Argomenti

`/schematizza <materia> <data-lezione>`

- `data-lezione` in formato `AAAA-MM-GG`, deve corrispondere a un file in
  `materie/<materia>/01-lezioni/`.
- Se omessa, elenca le lezioni con `stato: grezzo` per quella materia e
  chiedi quale processare — non processarle tutte in blocco senza conferma,
  perché ognuna merita una lettura dedicata.

## Procedura

### 1. Prepara il contesto

- Leggi `materie/<materia>/materia.yml` (prefisso ID, `prossimo_ultimo_id`).
- Leggi **tutte** le note in `02-concetti/` della materia (solo il
  frontmatter: id, titolo, tag — non serve il corpo) per sapere cosa esiste
  già ed evitare duplicati.
- Leggi il file di lezione indicato.

### 2. Costruisci lo schema gerarchico

Aggiungi in coda al file di lezione (sotto un separatore `---` e un titolo
`## Schema`) un outline Markdown puntato, 2-3 livelli, che rispecchi la
struttura logica della lezione — non l'ordine cronologico in cui gli
argomenti sono stati detti, se i due divergono. Esempio:

```markdown
## Schema

- Pipeline
  - Hazard
    - Strutturali → risorsa condivisa
    - Dati (RAW, WAR, WAW)
    - Controllo → branch prediction
```

Se la lezione contiene relazioni non gerarchiche (cicli, frecce trasversali,
macchine a stati), aggiungi anche un blocco Mermaid subito dopo l'outline —
non forzare in un albero ciò che è un grafo.

Marca `stato: schematizzato` nel frontmatter del file di lezione.

### 3. Estrai le note-concetto

Per ogni concetto **nuovo** rilevante (non ogni frase: un concetto è
un'unità che avrebbe senso testare da sola — una definizione, un teorema, un
meccanismo, una procedura):

1. Controlla prima se esiste già un concetto equivalente in `02-concetti/`
   (anche con titolo diverso ma stesso significato). Se esiste, **non
   duplicare**: al più aggiungi un riferimento incrociato o arricchisci la
   nota esistente se la lezione ne dà una prospettiva nuova, segnalandolo nel
   riepilogo finale.
2. Se è davvero nuovo, assegna l'ID successivo: `C-<PREFISSO>-NNNN` a 4
   cifre, incrementando `prossimo_ultimo_id` in `materia.yml` (aggiornalo
   subito, non a fine batch, per evitare collisioni tra concetti creati nella
   stessa sessione).
3. Crea `materie/<materia>/02-concetti/C-<PREFISSO>-NNNN-slug.md` con il
   frontmatter definito in [CLAUDE.md](../../CLAUDE.md). Nei `prerequisiti`
   metti solo ID di concetti che servono per capire questo, non un elenco
   generico di argomenti collegati.
4. Il corpo della nota è conciso — stile appunto, non voce di enciclopedia.
   Se la lezione lascia il concetto solo abbozzato, scrivilo così com'è e
   marca `stato: bozza` invece di completarlo con conoscenza esterna.

### 4. Cosa fare con l'incompleto o l'ambiguo

Se un passaggio della lezione è incomprensibile o contraddittorio, non
scioglierlo silenziosamente: lascialo marcato `> ❓ DA CHIARIRE: <cosa>` sia
nello schema sia, se rilevante, nella nota-concetto. Non inventare mai
contenuto non presente negli appunti, anche quando sai come si completerebbe
l'argomento in generale — la lezione fa fede, non la tua conoscenza generale
della materia (vedi regola 1 in [CLAUDE.md](../../CLAUDE.md)).

### 5. Riepilogo finale

Riporta: quanti concetti nuovi creati (con ID e titolo), quanti concetti
esistenti arricchiti o collegati, e l'elenco di ogni `❓ DA CHIARIRE` lasciato
in sospeso — è la lista di cose da chiedere al docente o da rivedere.

## Cosa non fare

- Non generare flashcard qui (fase 3, comando separato).
- Non modificare i file in `05-esami/originali/`.
- Non ricompattare più lezioni insieme: questo comando lavora su **una
  lezione alla volta**, la compattazione multi-lezione è `/compatta`.
