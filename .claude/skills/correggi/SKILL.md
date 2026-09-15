---
name: correggi
description: Corregge un tentativo di simulazione scritta con la rubrica generata da /simula-esame, scrive il report in 06-simulazioni/ e aggiorna la confidenza dei concetti testati in base al risultato. È il meccanismo che dà un valore reale al campo confidenza delle note-concetto, finora sempre a 0.
---

# /correggi

Corregge una simulazione risolta e chiude il ciclo di testing scritto
(cattura → schema → flashcard → simulazione → correzione). È anche
l'unica skill autorizzata a scrivere `confidenza` in `02-concetti/*.md`
(vedi CLAUDE.md e la nota in `/compatta`, che segnala il campo fermo a 0
"finché non esiste un meccanismo che lo aggiorna dal ripasso reale" — è
questo).

## Argomenti

`/correggi <materia> <slug>`

dove `<slug>` è lo stesso usato da `/simula-esame` per generare
`05-esami/generati/<slug>-consegna.md` e `<slug>-soluzione.md`.

## Procedura

### 1. Verifica i prerequisiti

- Se manca `<slug>-soluzione.md`, fermati: non correggere senza rubrica,
  rischi di inventare la valutazione al posto del docente.
- Se manca `<slug>-consegna.md`, fermati e dillo.
- Se esiste già un file in `06-simulazioni/` che referenzia questa stessa
  consegna (campo `simulazione`), fermati e chiedi conferma prima di
  procedere: potrebbe essere un secondo tentativo genuino (rifarla per
  misurare il progresso), ma va segnalato esplicitamente invece di
  sovrascrivere silenziosamente lo storico di un tentativo precedente.

### 2. Leggi le risposte

Le risposte dello studente sono nelle "Aree di risposta" della consegna
(se ha lavorato a file) — o, se ha risolto su carta, sono state trascritte
lì da lui prima di lanciare questa skill. Se le aree di risposta sono
ancora tutte vuote/segnaposto, fermati e dillo: non c'è niente da
correggere.

### 3. Correggi esercizio per esercizio

Confronta ogni risposta con soluzione e rubrica di `<slug>-soluzione.md`:

- assegna un punteggio parziale motivato — se la rubrica prevede punti
  parziali, usali: non ridurre a giusto/sbagliato secco quando la fonte
  dice altrimenti;
- scrivi un feedback breve e concreto legato alla rubrica (cosa manca,
  cosa è sbagliato, quale passaggio non è stato considerato) — mai un
  generico "quasi giusto" o "rivedi la teoria" senza dire cosa.

### 4. Aggiorna la confidenza dei concetti testati

Per ogni concetto (`concetti` nella soluzione) toccato da almeno un
esercizio di questa simulazione:

1. Calcola la frazione ottenuta sugli esercizi che lo testano (punti
   assegnati / punti massimi, mediata se più di un esercizio lo tocca).
2. Converti in `confidenza` 0-5: `round(frazione × 5)`.
3. Scrivi quel valore nel frontmatter della nota in `02-concetti/`,
   sostituendo il valore precedente.

Non toccare `confidenza` per concetti non testati in questa simulazione —
un silenzio non è un giudizio, non abbassarlo né alzarlo senza evidenza.

### 5. Scrivi il report

In `06-simulazioni/AAAA-MM-GG-<slug>.md` (data odierna):

```yaml
---
materia: architettura
simulazione: 05-esami/generati/2026-09-15-pipeline-hazard-consegna.md
data: 2026-09-15
punteggio: 24
punteggio_totale: 30
concetti: [C-ARCH-0042, C-ARCH-0038]
---
```

```markdown
## Esercizio 1 — 5/6

**Risposta data:**

<riportata o riassunta dalla consegna>

**Valutazione:**

<cosa era corretto, cosa mancava, con riferimento alla rubrica>

---

## Riepilogo

- Punteggio totale: 24/30
- Concetti aggiornati: C-ARCH-0042 (confidenza 2 → 4), C-ARCH-0038 (confidenza 0 → 2)
- Nodi deboli emersi: <concetti con la frazione più bassa in questa simulazione>
```

## Riepilogo finale (in chat)

Riporta: punteggio totale, i concetti la cui confidenza è scesa (da
ripassare prima di tutto) o salita, e se qualche esercizio è stato
corretto "a occhio" per rubrica incompleta o assente su un passaggio —
dillo esplicitamente, non far sembrare la correzione precisa quanto
quella di un docente se non lo è stata.

## Cosa non fare

- Non correggere senza `<slug>-soluzione.md`.
- Non inventare cosa avrebbe dovuto rispondere lo studente se un'area di
  risposta è vuota — segnala l'esercizio come non svolto (0 punti), non
  saltarlo in silenzio.
- Non toccare `confidenza` di concetti non testati in questa simulazione.
- Non sovrascrivere una correzione già esistente per lo stesso slug senza
  prima segnalarlo (vedi punto 1).
