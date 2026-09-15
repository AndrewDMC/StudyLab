---
name: genera-flashcard
description: Genera flashcard di active recall a partire dai concetti in 02-concetti/ non ancora coperti, salvandole per argomento in 04-flashcard/ con stato "proposta" in attesa di curazione dell'utente. Usare dopo che una lezione è stata schematizzata, tipicamente 24-48h dopo (mai lo stesso giorno).
---

# /genera-flashcard

Genera carte di richiamo attivo dai concetti che non hanno ancora flashcard,
le raggruppa per argomento in `04-flashcard/`, e le lascia in `stato:
proposta` finché l'utente non le cura. Non tocca lo stato di ripetizione
spaziata (`srs/state.json`): quello si popola solo quando una carta viene
approvata e vista per la prima volta dall'app di ripasso.

## Argomenti

`/genera-flashcard <materia> [argomento|C-XXX-NNNN]`

- Senza argomento: processa tutti i concetti `stato: attivo` della materia
  che non compaiono ancora in nessun mazzo di `04-flashcard/`.
- Con un tag/argomento: filtra sui concetti che lo hanno in `tag`.
- Con un ID di concetto: genera solo per quello (utile dopo aver corretto o
  esteso una nota specifica).

Non generare mai per concetti `stato: bozza` (sono incompleti per
definizione, vedi [CLAUDE.md](../../CLAUDE.md)) — segnalali nel riepilogo
finale invece di forzare una carta su materiale insufficiente.

## Procedura

### 1. Individua i concetti da coprire

1. Leggi tutti i file in `04-flashcard/` della materia ed estrai gli ID
   `[C-XXX-NNNN]` già presenti in qualche domanda — quello è l'insieme dei
   concetti già coperti.
2. Leggi `02-concetti/` e seleziona quelli `stato: attivo` non ancora
   coperti (o quelli richiesti esplicitamente dagli argomenti).

### 2. Genera le carte, concetto per concetto

Per ogni concetto, **massimo 3-5 carte**, seguendo queste regole (vedi anche
il piano, §2):

- **Una carta = un fatto atomico.** Mai una domanda che ne richiede tre per
  essere risposta. Se un concetto è complesso, spezzalo in più carte
  mirate piuttosto che scriverne una con risposta lunga.
- **Niente sì/no, niente risposte indovinabili dalla domanda stessa.** Una
  domanda del tipo "È vero che X?" non allena il richiamo, lo bypassa.
- **Per i concetti di tipo `dimostrazione` o con una dimostrazione nel
  corpo**, separa sempre in carte distinte: l'*enunciato*, le *ipotesi*, e
  l'*idea chiave* della dimostrazione (mai l'intera dimostrazione riga per
  riga — quella si ripassa dalla nota, non da una flashcard). È il buco più
  comune all'orale: sapere l'enunciato ma non il perché.
- **Per i concetti con un esempio lavorato** (come `tipo: procedura`), fai
  almeno una carta che chieda di applicare il procedimento, non solo di
  ricordarlo a parole.
- La risposta è **concisa**: se serve più di 3-4 righe, il concetto andrebbe
  probabilmente spezzato in due note, segnalalo nel riepilogo invece di
  scrivere una risposta-tema.
- Non copiare il corpo della nota-concetto parola per parola nella risposta:
  riformula in forma di richiamo, altrimenti la carta allena il riconoscere
  il testo, non il ricordarlo.

### 3. Formato del file

Un file per argomento in `04-flashcard/<slug-argomento>.md` (usa il tag
prevalente dei concetti, o crea `varie.md` se non c'è un argomento comune).
Se il file esiste già, aggiungi le nuove carte in coda, non riscriverlo.

```markdown
---
materia: matematica
argomento: estremi-insiemi
---

## [C-MAT-0002] Cos'è il maggiorante di un insieme A?
?
Un numero M tale che x ≤ M per ogni x ∈ A.
<!-- srs: a1b2c3 -->
<!-- stato: proposta -->

## [C-MAT-0002] Come si definisce l'estremo superiore sup(A)?
?
Il più piccolo dei maggioranti di A.
<!-- srs: d4e5f6 -->
<!-- stato: proposta -->
```

- L'ID `<!-- srs: xxxxxx -->` è **6 caratteri esadecimali minuscoli**,
  generati casualmente. Prima di assegnarne uno, verifica che non collida
  con nessun ID `srs:` già presente in `04-flashcard/` (in qualunque materia)
  né con una chiave già in `srs/state.json` — è la chiave primaria della
  carta, deve restare stabile per sempre anche se il testo cambia.
- `<!-- stato: proposta -->` finché l'utente non cura il mazzo. Quando
  l'utente approva (a mano, cambiando il commento in `attiva`, o cancellando
  la carta se non la vuole), quella carta entra nella rotazione dell'app.
  Questa skill non cambia mai `proposta` in `attiva` da sola.

### 4. Riepilogo finale

Riporta: quante carte generate, per quali concetti, e segnala esplicitamente:
- i concetti `stato: bozza` saltati (da completare prima di generare carte),
- ogni concetto per cui hai dovuto spezzare oltre 5 carte per coprirlo
  davvero (probabile segnale che la nota andrebbe divisa in due),
- un promemoria: **la curazione è il passo successivo, non opzionale** —
  cancellare le carte deboli ora costa 5 minuti, tenerle costa ripassi
  sprecati per mesi.

## Cosa non fare

- Non generare più di 5 carte per concetto, anche se il materiale
  permetterebbe di farne di più.
- Non promuovere da solo `proposta` ad `attiva`.
- Non scrivere in `srs/state.json`.
- Non generare per concetti `stato: bozza` o `stato: archiviato`.
- Non duplicare una carta già esistente per lo stesso concetto con la stessa
  domanda in sostanza — se il concetto è già ben coperto, dillo nel
  riepilogo invece di aggiungere rumore.
