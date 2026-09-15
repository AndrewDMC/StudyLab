---
materia: matematica
tipo: settimanale
periodo: 2024-W40
concetti: [C-MAT-0001, C-MAT-0002, C-MAT-0003, C-MAT-0004, C-MAT-0005]
generato: 2026-09-15
---

## Mappa dei concetti

Un'unica catena di dipendenze, non argomenti scollegati: la settimana ha
introdotto la gerarchia numerica e ne ha usata la struttura per definire
l'estremo superiore, fino a un esempio che la mette alla prova.

```
C-MAT-0001 (N ⊆ Z ⊆ Q ⊆ R)
  └─ C-MAT-0002 (estremo superiore, maggiorante)
       ├─ C-MAT-0003 (massimo: caso particolare di sup)
       │    └─ C-MAT-0004 (esempio: sup senza massimo in Q)
       └─ C-MAT-0005 (assioma di completezza di R) — bozza, non ripreso oltre l'accenno
```

C-MAT-0004 è il concetto-cerniera della settimana: è l'unico che mette
insieme sia C-MAT-0002 sia C-MAT-0003 (mostra un sup che non è massimo), ed
è anche l'esempio che *motiverebbe* C-MAT-0005 — ma quel collegamento è
lasciato implicito negli appunti originali (vedi `❓ DA CHIARIRE` nella
lezione), quindi resta un buco aperto più che una sintesi da riportare qui
come fatto acquisito.

## Schema unico

- **Insiemi numerici**: N ⊆ Z ⊆ Q ⊆ R, R include gli irrazionali
- **Estremo superiore** sup(A): il più piccolo dei maggioranti
  - se sup(A) ∈ A → è il **massimo**
  - un insieme può avere sup senza avere massimo (vedi esempio sotto)
- **Esempio guida**: A = {x ∈ Q : x² < 2}
  - limitato superiormente in Q, ma **senza massimo in Q**
  - sup(A) = √2, esiste **solo in R**
  - è l'esempio che la lezione ha usato per introdurre l'idea che Q "ha
    dei buchi" che R non ha — collegamento con la completezza di R non
    reso esplicito
- **Assioma di completezza di R** (solo accennato): ogni sottoinsieme non
  vuoto e limitato superiormente ha sup in R — da riprendere

## Nodi deboli

⚠️ Limite di questa sintesi, da segnalare invece di nascondere: il campo
`confidenza` di tutti e 5 i concetti è ancora **0** in `02-concetti/`,
perché nessun ripasso in Active Recall ha ancora retroagito su quel campo
(il collegamento SRS → confidenza non è ancora costruito, vedi Fase 6/7 del
piano). Questa sezione quindi non distingue "mai capito" da "mai
ripassato" — trattala come una lista di *candidati* da ripassare per primi,
non come una diagnosi.

- **C-MAT-0005 (assioma di completezza)** — l'unico vero nodo scoperto
  davvero: è `bozza`, senza flashcard (per regola, non se ne generano su
  concetti in bozza), e il collegamento con C-MAT-0004 non è mai stato
  reso esplicito negli appunti. Da completare quando la lezione lo riprende.
- Gli altri 4 concetti hanno tutti almeno una flashcard attiva — la
  copertura c'è, resta da accumulare ripasso reale.

## Domande di collegamento trasversale

1. Perché il fatto che A = {x ∈ Q : x² < 2} non abbia massimo in Q dice
   qualcosa sulla differenza strutturale tra Q e R, e non è solo una
   curiosità isolata su un insieme particolare?
2. sup(A) è sempre anche massimo di A? In quale caso sì, in quale caso no —
   e l'esempio della settimana in quale dei due casi ricade?
3. Come si collega la gerarchia N ⊆ Z ⊆ Q ⊆ R alla nozione di completezza
   accennata a fine lezione? (Nota: la lezione non risponde a questa
   domanda — è il collegamento da chiedere al professore o da riprendere.)
