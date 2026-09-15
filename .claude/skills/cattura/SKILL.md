---
name: cattura
description: Trascrive il materiale grezzo in 00-inbox/ (foto di appunti, PDF, slide, testo) in appunti di lezione puliti e leggibili in 01-lezioni/, senza schematizzare né creare concetti. Usare quando l'utente ha appena buttato dentro materiale nuovo e vuole solo che diventi un file di lezione leggibile.
---

# /cattura

Prende ciò che è in `materie/<materia>/00-inbox/` e produce un file di
lezione pulito in `materie/<materia>/01-lezioni/`. Non schematizza, non crea
concetti: quella è `/schematizza` (fase successiva, separata di proposito).

## Argomenti

`/cattura <materia> [file specifico]`

- Se non è dato un file specifico, processa **tutto** ciò che trova in
  `00-inbox/` per quella materia, un file (o gruppo di file con la stessa
  data) alla volta.
- Se non è data la materia, elenca le materie con elementi in `00-inbox/` e
  chiedi quale processare — non indovinare tra materie diverse.

## Procedura

1. Leggi `materie/<materia>/materia.yml` per il prefisso ID e il contesto.
2. Per ogni elemento in `00-inbox/`:
   - **Immagine** (foto di appunti a mano) → leggila direttamente. Trascrivi
     il contenuto **fedelmente**: se una parola o un simbolo non è leggibile,
     scrivi `[illeggibile]` sul posto, non indovinare. Non correggere la
     matematica o la logica dell'autore anche se sembra sbagliata — è materiale
     grezzo, la correzione è compito dell'utente o di `/schematizza` più avanti,
     mai di questa fase.
   - **PDF/PPTX di slide** → estrai il testo e la struttura (titoli, elenchi
     puntati). Le slide del docente sono già strutturate: preservane la
     gerarchia, non riscriverle in prosa.
   - **Testo già in Markdown** (appunti digitati direttamente in `00-inbox/`)
     → è già utilizzabile: pulisci solo la formattazione, non il contenuto.
   - **Audio già trascritto** (testo prodotto da trascrizione locale, §7 del
     piano) → tratta come testo grezzo: taglia le ripetizioni tipiche del
     parlato ("cioè", "quindi dicevo") ma non riassumere né interpretare.
3. Determina la **data della lezione**: dal nome del file se è in formato
   riconoscibile (`AAAA-MM-GG`, `GG-MM-AAAA`, `GG_MM_AAAA`), altrimenti dal
   contenuto (es. una data scritta in alto agli appunti), altrimenti chiedi
   all'utente — non inventare mai una data.
4. Scrivi `materie/<materia>/01-lezioni/AAAA-MM-GG-slug-argomento.md` con il
   frontmatter definito in [CLAUDE.md](../../CLAUDE.md):

   ```yaml
   ---
   materia: <materia>
   data: AAAA-MM-GG
   titolo: <titolo breve dell'argomento>
   fonte: 00-inbox/<nome file originale>
   stato: grezzo
   ---
   ```

   Se più file dell'inbox appartengono alla stessa lezione (es. tre foto di
   pagine successive), uniscili in un unico file di lezione, nell'ordine
   corretto — se l'ordine non è ovvio dai nomi file, chiedi.

5. **Non cancellare l'originale in `00-inbox/`.** Spostalo in
   `00-inbox/_processati/` (creala se non esiste) così l'inbox resta pulita
   ma l'originale è tracciabile in caso di errore di trascrizione.
6. A fine esecuzione, riporta un riepilogo breve: quali file di lezione sono
   stati creati/aggiornati, e segnala esplicitamente ogni `[illeggibile]` o
   incertezza rilevante lasciata nel testo, così l'utente sa cosa controllare
   a mano prima di passare a `/schematizza`.

## Cosa non fare

- Non generare uno schema gerarchico qui: è compito di `/schematizza`.
- Non creare o aggiornare note in `02-concetti/`.
- Non riassumere: l'obiettivo è una trascrizione fedele e leggibile, non una
  sintesi. La sintesi arriva più avanti nella pipeline (fasi 2 e 4).
- Non processare `risorse/`: solo `00-inbox/` della materia indicata.
