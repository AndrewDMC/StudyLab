---
name: compatta
description: Compatta le lezioni e i concetti di una settimana (o le sintesi settimanali di un mese) in un'unica sintesi in 03-sintesi/, con mappa dei concetti, nodi deboli e domande di collegamento trasversale. Usare a fine settimana/mese, mai al posto di /schematizza sulla singola lezione.
---

# /compatta

Ricompatta un periodo di studio in un documento unico, molto più corto
della somma delle lezioni che riassume. Non è uno schema in più: è il
livello sopra gli schemi, quello che serve per ripassare "a volo d'uccello"
prima di un'interrogazione o per prepararsi alla sessione.

## Argomenti

`/compatta <materia> settimana [AAAA-Www]`
`/compatta <materia> mese [AAAA-MM]`

- Se il periodo è omesso, usa la settimana/mese corrente (ISO 8601: la
  settimana inizia di lunedì).
- `settimana` legge le **lezioni** del periodo in `01-lezioni/` (e i
  concetti da esse referenziati).
- `mese` legge le **sintesi settimanali già esistenti** del mese in
  `03-sintesi/settimana-*.md`, **non** le lezioni direttamente — è una
  ricompattazione di sintesi, non un'altra passata sugli appunti grezzi
  (vedi PIANO.md §2: struttura ad albero, altrimenti a fine semestre il
  documento mensile è illeggibile).
  - Se per il mese richiesto non esiste ancora nessuna sintesi settimanale,
    fermati e dillo: non generare la mensile leggendo le lezioni al posto
    loro. Suggerisci di lanciare prima `/compatta <materia> settimana` per
    le settimane mancanti.

## Procedura

### 1. Raccogli il materiale del periodo

**Settimana:**
- Tutte le lezioni in `01-lezioni/` con `data` nel range della settimana
  ISO richiesta. Se non ce n'è nessuna, fermati e dillo — non c'è niente
  da compattare.
- Le note in `02-concetti/` con `lezione` (data di prima comparsa) nello
  stesso range.

**Mese:**
- Tutti i file `03-sintesi/settimana-AAAA-Www.md` la cui settimana ricade
  (anche parzialmente) nel mese richiesto.

### 2. Costruisci la sintesi

Il documento va in `03-sintesi/settimana-AAAA-Www.md` o
`03-sintesi/mensile-AAAA-MM.md`, con questo frontmatter:

```yaml
---
materia: <slug>
tipo: settimanale   # settimanale | mensile
periodo: 2026-W38    # o 2026-09 per il mensile
concetti: [C-ARCH-0038, C-ARCH-0042, ...]   # tutti quelli coperti
generato: 2026-09-20   # data di generazione, non del periodo
---
```

Corpo, in quest'ordine:

1. **Mappa dei concetti del periodo** — non un elenco piatto, ma
   raggruppata per come i concetti si collegano tra loro (usa i
   `prerequisiti` delle note-concetto). Se due concetti di lezioni diverse
   dello stesso periodo sono in realtà lo stesso argomento visto da
   angolazioni diverse, dillo esplicitamente — è un collegamento che vale
   la pena notare, non un'coincidenza da ignorare.
2. **Schema unico** — outline gerarchico di ~2 pagine (non di più: se il
   materiale del periodo è vasto, comprimi, non allungare). Non è la somma
   degli schemi delle singole lezioni incollati uno dopo l'altro: è una
   sintesi che presuppone che il lettore li abbia già visti.
3. **Nodi deboli** — concetti con `confidenza` bassa (0-2) o mai testati
   (nessuna flashcard in `04-flashcard/` che li referenzi — cercali per
   `[C-XXX-NNNN]` nei mazzi). Questa è la lista più utile del documento:
   dice cosa ripassare prima di tutto.
4. **Domande di collegamento trasversale** — 3-5 domande nello stile "mi
   colleghi X con Y?", quelle che un esame orale fa più spesso e che
   nessuna singola lezione prepara da sola. Costruiscile solo se esiste
   davvero un collegamento sostanziale tra concetti del periodo — mai
   forzarne uno debole solo per riempire la sezione.

### 3. Cosa non fare

- Non inventare collegamenti tra concetti che non condividono davvero
  logica o prerequisiti, solo perché sono capitati nello stesso periodo.
- Non ripetere per intero il contenuto delle note-concetto: questo
  documento presuppone che il lettore possa tornare alla nota se serve
  il dettaglio — qui va solo la vista d'insieme.
- Non modificare `02-concetti/` né `04-flashcard/`: `/compatta` legge,
  non scrive altrove che nella propria sintesi.
- Non generare una mensile leggendo le lezioni se mancano le settimanali
  del mese (vedi sopra) — fermati e dillo.

## Riepilogo finale

Riporta: il periodo compattato, quanti concetti coperti, l'elenco dei nodi
deboli (è la parte che l'utente legge per prima), e se il documento ha
dovuto essere tagliato per restare entro le ~2 pagine — in quel caso
segnala cosa hai omesso, non lasciarlo silenzioso.
