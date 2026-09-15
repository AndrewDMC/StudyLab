---
name: estrai-esami
description: Legge i PDF/scan dei temi d'esame in 05-esami/originali/ e li struttura in 05-esami/estratti/, un file per PDF, con per ogni esercizio tipologia, concetti richiesti, difficoltà, punteggio e traccia di soluzione. È la base per /simula-esame: va lanciata prima. Non modifica mai 05-esami/originali/.
---

# /estrai-esami

Trasforma i temi d'esame passati (PDF, spesso scansioni) in una tassonomia
strutturata e leggibile: da qui `/simula-esame` genera varianti nuove dello
stesso stampo. `05-esami/originali/` resta **di sola lettura** (vedi
CLAUDE.md, regola 2) — questa skill legge quei file, non li modifica né
li rinomina mai.

## Argomenti

`/estrai-esami <materia> [percorso-parziale]`

- Senza argomento: processa tutti i file non ancora estratti in tutta la
  sottostruttura di `05-esami/originali/` (ricorsiva su tutte le
  sottocartelle, es. `anni-precedenti/`, `secondo-parziale/`).
- Con un percorso parziale (es. `secondo-parziale` o un frammento di nome
  file): filtra solo i file il cui percorso lo contiene.

**Il filtro è un confronto letterale (sottostringa, case-insensitive) sul
percorso relativo del file, non un invito a processare "l'argomento
correlato" o l'intera cartella che lo contiene.** Se il filtro è
`secondo-parziale`, processa solo i file dentro quella cartella — non
`anni-precedenti/`. Se il filtro è `testi e correzioni`, processa *solo*
i file il cui nome contiene esattamente quella stringa (es. `2008-06-16
testi e correzioni.pdf`), non anche `2008-06-16.pdf` o altri file dello
stesso anno/cartella solo perché "sembrano collegati": un lotto più
grande di quello richiesto consuma la finestra di rate limit dell'utente
senza che l'abbia deciso lui (vedi PIANO.md §2, "Sui rate limit").

## Procedura

### 1. Individua cosa manca

1. Elenca ricorsivamente i file in `05-esami/originali/` della materia
   (PDF; anche scan `.png`/`.jpg` se presenti, stesso trattamento). Se è
   stato passato un percorso parziale, scarta subito i file il cui
   percorso non lo contiene — non rientrano nel lotto di questa
   esecuzione, in nessun caso.
2. Leggi il frontmatter di ogni file già presente in `05-esami/estratti/`:
   il campo `fonte` riporta il percorso relativo **alla materia** del file
   sorgente (es. `05-esami/originali/secondo-parziale/2008-06-16.pdf`,
   senza `materie/<materia>/` davanti — stessa convenzione di `fonte`
   nelle lezioni, vedi CLAUDE.md). Salta ogni originale già coperto da un
   estratto — non ri-estrarre da zero ogni volta.
3. Se non resta nulla da estrarre (tutto già coperto, o il filtro non
   combacia con nessun file), dillo e fermati.
4. **Lotto massimo per esecuzione: 8 file.** Se ne restano di più (tipico
   quando l'argomento è omesso e ci sono molti originali storici), processa
   solo i primi 8 in ordine di percorso e fermati lì — non provare a fare
   tutto in un'unica sessione lunga: rischia di esaurire la finestra di
   rate limit dell'account a metà lavoro, lasciando un estratto a metà
   scritto (vedi PIANO.md §2, "Sui rate limit" — batch piccoli e
   ripetibili, non un'unica sessione fiume). Nel riepilogo finale, elenca
   esplicitamente quanti file restano e che si rilancia lo stesso comando
   per continuare.

### 2. Leggi ogni PDF

Usa il tool di lettura file direttamente sul PDF — legge nativamente
anche pagine scansionate, senza bisogno di OCR esterno, ed è più accurato
di un OCR classico sulla scrittura a mano. Per un PDF lungo, leggilo a
blocchi di pagine invece di un colpo solo.

### 3. Per ogni esercizio individuato nel testo

- **testo**: trascritto fedelmente. Non riformulare: questa è la fonte
  primaria da cui `/simula-esame` costruirà varianti, un errore qui si
  propaga a valle.
- **concetti**: cerca in `02-concetti/` della materia quali note l'esercizio
  testa davvero (non "sembrano collegate" — servono per risolverlo) e
  collega con l'ID esistente (`C-XXX-NNNN`). Se un concetto necessario non
  esiste ancora come nota, **non crearlo qui** — non è compito di questa
  skill (vedi CLAUDE.md, regola 3: gli ID nascono in `/schematizza`).
  Elencalo tra virgolette col titolo in chiaro invece dell'ID
  (`"forwarding tra stadi"`), e segnalalo nel riepilogo finale.
- **tipo**: categoria breve (es. `pipeline-hazard`, `dimostrazione`,
  `calcolo-numerico`). Riusa una categoria già presente in altri estratti
  della stessa materia se l'esercizio è dello stesso genere, invece di
  inventarne una leggermente diversa ogni volta — la tassonomia serve a
  `/simula-esame` per riconoscere pattern ricorrenti, non a catalogare
  finemente ogni sfumatura.
- **difficoltà**: `bassa` | `media` | `alta`, giudicata dal peso/posizione
  nell'esame e dalla complessità del testo.
- **punteggio**: come indicato nel testo originale (es. `6/30`). Se il PDF
  non riporta un punteggio per esercizio, scrivi `non specificato` — non
  inventare una ripartizione plausibile.
- **schema_soluzione**: solo se presente nella fonte (i file con "testi e
  correzioni" nel nome la contengono di solito). Se assente, scrivi
  `> ❓ DA CHIARIRE: soluzione non presente nella fonte`.

Se un passaggio è illeggibile (scansione rovinata, calligrafia impossibile,
pagina mancante), marca quell'esercizio `> ❓ DA CHIARIRE: <cosa>` invece
di indovinare — è la regola non negoziabile 1 di CLAUDE.md, qui più che
altrove: un esercizio d'esame allucinato è peggio di uno mancante.

`data_esame`: deducila dal nome del file (spesso è già una data, es.
`2008-06-16.pdf`) o dall'intestazione del testo; se non deducibile,
lascia `null`, non indovinare un anno.

## Formato del file estratto

Un file per PDF sorgente, in `05-esami/estratti/<slug>.md` (slug dal nome
del file, minuscolo, spazi e parentesi → trattini).

```yaml
---
materia: architettura
fonte: 05-esami/originali/secondo-parziale/2008-06-16.pdf
data_esame: 2008-06-16
estratto: 2026-09-15
esercizi: 4
---
```

```markdown
## Esercizio 1

- concetti: [C-ARCH-0042, C-ARCH-0038]
- tipo: pipeline-hazard
- difficolta: media
- punteggio: 6/30

**Testo:**

<trascrizione fedele dell'esercizio>

**Traccia di soluzione:**

<traccia dedotta dal PDF, o `> ❓ DA CHIARIRE: soluzione non presente nella fonte`>
```

Un blocco `## Esercizio N` per ciascun esercizio del PDF, nell'ordine in
cui compaiono.

## Riepilogo finale

Riporta: quanti file processati, quanti esercizi estratti in totale,
l'elenco dei concetti mancanti segnalati (da valutare per una nota nuova
via `/schematizza`), quanti esercizi marcati `❓`, e — se il lotto è stato
limitato a 8 file (punto 4) — quanti file restano ancora da estrarre e che
va rilanciato lo stesso comando per continuare.

## Cosa non fare

- Non modificare né rinominare mai un file in `05-esami/originali/`.
- Non creare concetti nuovi in `02-concetti/` — solo segnalarli.
- Non generare varianti d'esame: è compito di `/simula-esame`.
- Non inventare punteggi o schemi di soluzione assenti dalla fonte.
- Non ri-estrarre un PDF già coperto da un file in `05-esami/estratti/`.
- Non processare file fuori dal filtro richiesto perché "sembrano
  collegati" (stesso anno, stessa cartella) — il filtro è letterale.
- Non superare 8 file per esecuzione anche se ne restano molti di più.
