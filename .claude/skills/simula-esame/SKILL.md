---
name: simula-esame
description: Genera una nuova variante d'esame — stessa struttura e stessi pattern dei temi passati in 05-esami/estratti/, con dati e formulazioni diverse — salvandola in 05-esami/generati/ come consegna (senza soluzioni) più un file soluzione separato con la rubrica. Richiede che /estrai-esami sia già stato lanciato sulla materia.
---

# /simula-esame

Genera un tema d'esame nuovo dallo stesso stampo di quelli passati: non
quattro temi da imparare a memoria, ma infiniti dello stesso pattern (vedi
PIANO.md §2, Fase 5). Usa `05-esami/estratti/` come tassonomia — se è
vuota o non copre il filtro richiesto, questa skill non ha materiale da
cui generare in modo affidabile.

## Argomenti

`/simula-esame <materia> [argomento|C-XXX-NNNN]`

- Senza argomento: genera una variante rappresentativa dell'esame intero —
  stessa distribuzione di tipologie e difficoltà vista negli estratti.
- Con un argomento/tag o un ID di concetto: genera solo esercizi su quel
  tema, per un allenamento mirato invece che sull'esame completo.

## Procedura

### 1. Verifica il materiale disponibile

Se `05-esami/estratti/` della materia è vuota, o il filtro richiesto non
combacia con nessun esercizio estratto, fermati e dillo: suggerisci di
lanciare prima `/estrai-esami <materia>`. Non generare "a memoria" da
conoscenza generale sull'argomento — violerebbe la regola 1 di CLAUDE.md
proprio nel punto in cui conta di più: un esercizio d'esame plausibile ma
diverso da come lo pone davvero il docente è peggio di inutile.

### 2. Leggi la tassonomia

Dagli estratti pertinenti (filtrati per argomento se richiesto): quanti
esercizi tipicamente compongono l'esame, di che `tipo`, con che
`difficolta`, con che `punteggio`. Se `materia.yml` riporta
`struttura_esame` o un tempo tipico, usalo per il tempo stimato della
variante.

### 3. Genera un esercizio nuovo per ciascuno slot della tassonomia

Stesso `tipo` e stessa `difficolta` dello slot che rappresenta, ma **dati,
numeri o formulazione diversi** da qualunque esercizio già visto negli
estratti — non è una riformulazione cosmetica di un esercizio esistente
(stessi numeri, testo leggermente riscritto): deve testare la comprensione
del pattern, non la memoria del testo originale. Resta sugli stessi
concetti (stessi ID già presenti in `02-concetti/`) — non introdurre
argomenti mai comparsi negli estratti della materia.

Se il filtro per argomento non offre abbastanza slot per una variante
sensata, genera solo ciò che è coperto e segnala la lacuna nel riepilogo
finale, invece di riempire forzando esercizi fuori tema.

### 4. Scrivi soluzione e rubrica

Per ciascun esercizio generato: soluzione completa e una rubrica di
correzione esplicita (come si distribuiscono i punti tra i passaggi, cosa
vale punteggio pieno/parziale/zero). È ciò che userà `/correggi` — se la
rubrica è vaga, la correzione a valle sarà vaga.

## Output: due file gemelli

Stesso slug in `05-esami/generati/`: `<slug>-consegna.md` e
`<slug>-soluzione.md`. Slug: `AAAA-MM-GG-<argomento-o-completo>` (es.
`2026-09-15-pipeline-hazard.md` o `2026-09-15-completo.md`).

**`<slug>-consegna.md`** — quello che lo studente apre per svolgere
l'esame. Solo testo degli esercizi, **nessuna soluzione, nessun
riferimento ai concetti** (altrimenti spoilerebbe cosa viene chiesto), e
un'area di risposta vuota per ciascun esercizio (per chi lavora a file
invece che su carta):

```yaml
---
materia: architettura
tipo: variante
basato_su: [05-esami/estratti/2008-06-16.md, 05-esami/estratti/2010-09-13.md]
generato: 2026-09-15
tempo_minuti: 90
punteggio_totale: 30
---
```

```markdown
## Esercizio 1 (6 punti)

<testo dell'esercizio>

**Area di risposta:**

<!-- scrivi qui la tua risposta, o lascia vuoto se risolvi su carta -->
```

**`<slug>-soluzione.md`** — separato apposta: aprirlo prima di aver
provato l'esame vanifica la simulazione.

```yaml
---
materia: architettura
consegna: 05-esami/generati/2026-09-15-pipeline-hazard-consegna.md
generato: 2026-09-15
---
```

```markdown
## Esercizio 1

- concetti: [C-ARCH-0042]
- punteggio_massimo: 6

**Soluzione:**

<soluzione completa>

**Rubrica:**

<come si assegnano i punti parziali>
```

## Riepilogo finale

Riporta: quanti esercizi generati, punteggio totale, tempo stimato, e il
passo successivo — *"risolvi in `<slug>-consegna.md` (area di risposta, o
su carta), poi lancia `/correggi <materia> <slug>`"*.

## Cosa non fare

- Non scrivere la soluzione nella consegna.
- Non riusare un esercizio degli estratti quasi identico (dati diversi ma
  stessa domanda parola per parola non è una variante).
- Non generare esercizi su concetti/argomenti mai visti negli estratti
  della materia.
- Non generare se `05-esami/estratti/` non copre il filtro richiesto —
  fermati e dillo (vedi punto 1).
