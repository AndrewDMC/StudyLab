---
materia: matematica
data: 2024-09-30
titolo: Insiemi numerici e estremo superiore
fonte: 00-inbox/2024-09-30-insiemi-numerici.md
stato: schematizzato
---

Giovanni Peccati - Matematica per Economia e Management

## Insiemi numerici

- N = numeri naturali, si parte da 0 (convenzione del corso)
- Z = interi relativi, include i negativi
- Q = numeri razionali, cioè p/q con p, q interi e q ≠ 0
- R = numeri reali, include gli irrazionali (es. √2, π)

N ⊆ Z ⊆ Q ⊆ R

## Estremo superiore

Un insieme A è **limitato superiormente** se esiste un numero M tale che
x ≤ M per ogni x in A. M si chiama **maggiorante**.

Il più piccolo dei maggioranti si chiama **estremo superiore**, sup(A).
Se sup(A) appartiene ad A si chiama **massimo**.

**Esempio fatto a lezione:** A = { x ∈ Q : x² < 2 }.

Questo insieme è limitato superiormente in Q ma non ha massimo in Q (non c'è
un razionale che sia il più grande elemento). Ha però estremo superiore in R,
che è √2.

> ❓ DA CHIARIRE: non è chiaro dagli appunti se il professore abbia detto che
> questo esempio dimostra che Q non è completo, o se l'abbia solo accennato.

Definizione analoga per **estremo inferiore** / **minimo** / **minoranti**.

## Assioma di completezza di R

Accennato, non dimostrato in questa lezione: ogni sottoinsieme di R non vuoto
e limitato superiormente ammette estremo superiore in R.

---

## Schema

- Insiemi numerici
  - N ⊆ Z ⊆ Q ⊆ R (C-MAT-0001)
- Estremo superiore
  - Maggiorante, insieme limitato superiormente (C-MAT-0002)
  - sup(A) = più piccolo dei maggioranti (C-MAT-0002)
    - se sup(A) ∈ A → massimo (C-MAT-0003)
  - Esempio: A = {x ∈ Q : x² < 2} (C-MAT-0004)
    - limitato sup. in Q, ma senza massimo in Q
    - sup(A) = √2 ∈ R
    - ❓ collegamento con completezza di Q non chiarito dagli appunti
  - Estremo inferiore / minimo / minorante — definizione speculare (C-MAT-0002)
- Assioma di completezza di R (C-MAT-0005)
  - solo accennato, non dimostrato → da riprendere in una lezione successiva
