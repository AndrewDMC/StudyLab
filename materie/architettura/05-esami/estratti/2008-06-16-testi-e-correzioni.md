---
materia: architettura
fonte: 05-esami/originali/secondo-parziale/2008-06-16 testi e correzioni.pdf
data_esame: 2008-06-16
estratto: 2026-09-15
esercizi: 48
---

Nota: contiene 4 compiti (Compito 1–4), ciascuno con Prima Parte (7 esercizi) e Seconda Parte (5 esercizi), con soluzioni manoscritte. Il file `2008-06-16.md` contiene solo il testo del Compito 1 Prima Parte senza soluzioni.

---

<!-- ====== COMPITO 1 — PRIMA PARTE ====== -->

## Esercizio 1

- concetti: ["modulo e segno", "rappresentazione interi"]
- tipo: codifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 1 — Prima Parte)

(2 punti) Codificare i numeri interi (a) -76 e (b) 53 in modulo e segno a 8 bit

**Traccia di soluzione:**

(a) -76 → 1|100 1100 = 11001100  
(b) 53 → 0|011 0101 = 00110101

---

## Esercizio 2

- concetti: ["complemento a 2"]
- tipo: decodifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 1 — Prima Parte)

(2 punti) Determinare i numeri interi rappresentati dalle sequenze di bit (a) 1011100010 e (b) 1100100111 nella notazione in complemento a 2

**Traccia di soluzione:**

(a) 1011100010 → -286  
(b) 1100100111 → -217

---

## Esercizio 3

- concetti: ["conversione di base"]
- tipo: conversione-basi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 1 — Prima Parte)

(2 punti) Convertire da base 16 a base 8 i seguenti numeri naturali

**(a)** 9E2A  
**(b)** B6D8

**Traccia di soluzione:**

(a) 9E2A → 147052₈  
(b) B6D8 → 133330₈

---

## Esercizio 4

- concetti: ["mappe di Karnaugh", "SOP minimale", "funzioni booleane"]
- tipo: karnaugh-sop
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 1 — Prima Parte)

(6 punti) Determinare la forma SOP minimale della funzione booleana avente la seguente tabella di verità utilizzando il metodo delle mappe di Karnaugh:

| x₁ | x₂ | x₃ | x₄ | f |
|----|----|----|----|----|
| 0  | 0  | 0  | 0  | 1  |
| 0  | 0  | 0  | 1  | −  |
| 0  | 0  | 1  | 0  | 1  |
| 0  | 0  | 1  | 1  | 0  |
| 0  | 1  | 0  | 0  | 0  |
| 0  | 1  | 0  | 1  | 0  |
| 0  | 1  | 1  | 0  | −  |
| 0  | 1  | 1  | 1  | 1  |
| 1  | 0  | 0  | 0  | 1  |
| 1  | 0  | 0  | 1  | 0  |
| 1  | 0  | 1  | 0  | 1  |
| 1  | 0  | 1  | 1  | 1  |
| 1  | 1  | 0  | 0  | 1  |
| 1  | 1  | 0  | 1  | 0  |
| 1  | 1  | 1  | 0  | 1  |
| 1  | 1  | 1  | 1  | −  |

**Traccia di soluzione:**

SOP = x̄₂x̄₄ + x₁x̄₄ + x₁x₃ + x₂x₃

---

## Esercizio 5

- concetti: ["multiplexer", "circuito combinatorio"]
- tipo: circuito-mux
- difficolta: media
- punteggio: 4 punti

**Testo:** (Compito 1 — Prima Parte)

(4 punti) Disegnare il circuito combinatorio che realizza la funzione f(x₁,x₂,x₃,x₄) = x̄₃·(x̄₁·x₄) + x₃·(x̄₂·x₁·x̄₄) facendo uso solo di multiplexer con 2 linee di controllo (selezione).

**Traccia di soluzione:**

Due livelli di MUX 4:1. Primo livello controllato da (x₃,x₄), secondo da (x₁,x₂). Schema disegnato nella fonte.

---

## Esercizio 6

- concetti: ["automa a stati finiti (FSM)", "rete sequenziale", "riconoscimento pattern"]
- tipo: fsm-sintesi
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 1 — Prima Parte)

(7 punti) Disegnare il diagramma di stato di una Rete Sequenziale a singolo ingresso (x) e singola uscita (z) che restituisca in un determinato istante i ≥ 0 uscita uguale a 1 se e solo la sequenza di bit finora letta coincide con un'alternanza completa dei bit 010

**Traccia di soluzione:**

FSM con 5 stati (q₀..q₄): q₀ stato iniziale, z=0; q₁ dopo aver letto 0, q₂ dopo 01, q₃ dopo 010 (accettante, z=1 con output 1 all'uscita); q₄ stato trappola per sequenze non matching. Diagramma con transizioni 0/0 e 1/0 disegnato nella fonte.

---

## Esercizio 7

- concetti: ["flip-flop SR", "progettazione rete sequenziale", "tabella delle transizioni", "minimizzazione funzioni eccitazione"]
- tipo: fsm-progettazione
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 1 — Prima Parte)

(7 punti) Progettare la rete sequenziale corrispondente al seguente diagramma di stato (avente gli stati già codificati), utilizzando flip-flop di tipo SR. In particolare determinare tutte le funzioni booleane minimizzate e disegnare la rete sequenziale corrispondente.

Diagramma di stato (stati codificati: 01, 10, 11):
- 01 → 10 con 0/1
- 01 → 11 con 1/0
- 10 → 01 con 1/0
- 10 → 11 con 1/0
- 11 → 11 con 0/0

> ❓ DA CHIARIRE: alcune transizioni del diagramma (grafico originale a stampa) potrebbero non essere state lette con precisione assoluta — verificare sull'originale.

**Traccia di soluzione:**

> ❓ DA CHIARIRE: s₁ parzialmente illeggibile nella soluzione manoscritta.

s₂ = x  
r₁ = x·y₁·y₂  
r₂ = x̄·ȳ₁  
z = x̄·ȳ₁ + x̄·ȳ₂ + x·y₁·y₂

---

<!-- ====== COMPITO 1 — SECONDA PARTE ====== -->

## Esercizio 8

- concetti: ["set di istruzioni (ISA)", "modello registro-registro", "esecuzione istruzioni"]
- tipo: esecuzione-istruzioni
- difficolta: bassa
- punteggio: 5 punti

**Testo:** (Compito 1 — Seconda Parte)

(5 punti) Cosa contengono i registri R1 e R2 dopo la seguente sequenza di istruzioni?  
LDI R1,2 – LDI R2,10 – MUL R1,R1,R2 – ADD R2,R1,R2 – SUB R1,R2,R1

**Traccia di soluzione:**

R1 = 10, R2 = 30

---

## Esercizio 9

- concetti: ["prestazioni CPU", "frequenza di clock", "CPI", "tempo di esecuzione"]
- tipo: cpi-prestazioni
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 1 — Seconda Parte)

(5 punti) Si assuma che un calcolatore esegua 4 tipi diversi di operazioni. Nella seguente tabella sono descritte le operazioni, il numero di cicli di clock necessari ad eseguirle (c_i) e il numero di volte che vengono eseguite da un dato programma:

| Tipo Istruzione     | c_i | Numero di esecuzioni |
|---------------------|-----|----------------------|
| Addizione           | 2   | 7·10⁶                |
| Moltiplicazione     | 2   | 4·10⁶                |
| Accesso in Memoria  | 4   | 5·10⁶                |
| Salti Condizionati  | 2   | 8·10⁶                |

Calcolare la frequenza di clock necessaria per eseguire il suddetto programma in 2 secondi.

**Traccia di soluzione:**

f = (2·7 + 2·4 + 4·5 + 2·8)·10⁶ / 2 = 29 MHz

---

## Esercizio 10

- concetti: ["modello registro-registro", "assembler", "istruzioni aritmetiche"]
- tipo: assembler
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 1 — Seconda Parte)

(5 punti) Determinare la sequenza di istruzioni assembler che realizzano lo statement di alto livello x = a²/c³ nel modello registro-registro

**Traccia di soluzione:**

```
LD  R1, A
LD  R2, C
MUL R1, R1, R1    ; R1 = a²
MUL R3, R2, R2    ; R3 = c²
MUL R3, R3, R2    ; R3 = c³
DIV R1, R1, R3    ; R1 = a²/c³
ST  X, R1
```

---

## Esercizio 11

- concetti: ["microprogrammazione", "microoperazioni", "segnali di controllo", "execute istruzione"]
- tipo: microprogrammazione
- difficolta: alta
- punteggio: 9 punti

**Testo:** (Compito 1 — Seconda Parte)

(9 punti) Determinare la fase di execute dell'istruzione CP1 (RA),V che ha l'effetto di copiare il contenuto della locazione di memoria di indirizzo simbolico V nella locazione di memoria il cui indirizzo è contenuto in RA, assumendo che nel formato in linguaggio macchina i 6 bit più significativi siano dedicati al codice operativo, i 5 bit successivi alla specifica del registro RA e i 21 bit meno significativi alla specifica dell'indirizzo V.

**Traccia di soluzione:**

| Ciclo | Segnali di Controllo |
|-------|----------------------|
| T5    | O^m\|IR[20:0]_out, MAR_in |
| T6    | MRD |
| T7    | MRD, DTR_in |
| T8    | RA_out, MAR_in |
| T9    | MWR, SELDTR_dir, DTR_out |
| T10   | MWR, SELDTR_dir, DTR_out |

---

## Esercizio 12

- concetti: ["legge di Amdahl", "accelerazione", "prestazioni sistema"]
- tipo: amdahl
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 1 — Seconda Parte)

(6 punti) In riferimento alla legge di Amdahl, si calcoli l'accelerazione di una data componente necessaria per far sì che l'accelerazione complessiva del sistema sia pari a 1,1, assumendo che la frequenza di utilizzo di tale componente sia pari a 1/5.

**Traccia di soluzione:**

A_comp = 1 / (4/5 + 1/(5·A_comp)) = 1,1 → A_comp = 11/6

---

<!-- ====== COMPITO 2 — PRIMA PARTE ====== -->

## Esercizio 13

- concetti: ["modulo e segno", "rappresentazione interi"]
- tipo: codifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 2 — Prima Parte)

(2 punti) Codificare i numeri interi (a) -92 e (b) 47 in modulo e segno a 8 bit

**Traccia di soluzione:**

(a) -92 → 11011100  
(b) 47 → 00101111

---

## Esercizio 14

- concetti: ["complemento a 2"]
- tipo: decodifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 2 — Prima Parte)

(2 punti) Determinare i numeri interi rappresentati dalle sequenze di bit (a) 1110110011 e (b) 1100101101 nella notazione in complemento a 2

**Traccia di soluzione:**

(a) 1110110011 → -77  
(b) 1100101101 → -211

---

## Esercizio 15

- concetti: ["conversione di base"]
- tipo: conversione-basi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 2 — Prima Parte)

(2 punti) Convertire da base 8 a base 16 i seguenti numeri naturali

**(a)** 74063  
**(b)** 24516

**Traccia di soluzione:**

(a) 74063₈ → 7833₁₆  
(b) 24516₈ → 284E₁₆

---

## Esercizio 16

- concetti: ["mappe di Karnaugh", "SOP minimale", "funzioni booleane"]
- tipo: karnaugh-sop
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 2 — Prima Parte)

(6 punti) Determinare la forma SOP minimale della funzione booleana avente la seguente tabella di verità utilizzando il metodo delle mappe di Karnaugh:

| x₁ | x₂ | x₃ | x₄ | f |
|----|----|----|----|----|
| 0  | 0  | 0  | 0  | 1  |
| 0  | 0  | 0  | 1  | 1  |
| 0  | 0  | 1  | 0  | 1  |
| 0  | 0  | 1  | 1  | 0  |
| 0  | 1  | 0  | 0  | 0  |
| 0  | 1  | 0  | 1  | 0  |
| 0  | 1  | 1  | 0  | −  |
| 0  | 1  | 1  | 1  | 0  |
| 1  | 0  | 0  | 0  | 1  |
| 1  | 0  | 0  | 1  | 1  |
| 1  | 0  | 1  | 0  | 1  |
| 1  | 0  | 1  | 1  | −  |
| 1  | 1  | 0  | 0  | 1  |
| 1  | 1  | 0  | 1  | −  |
| 1  | 1  | 1  | 0  | 0  |
| 1  | 1  | 1  | 1  | 1  |

**Traccia di soluzione:**

SOP = x₄x̄₃ + x₁x̄₄ + x̄₂x̄₃ + x̄₂x̄₄

---

## Esercizio 17

- concetti: ["multiplexer", "circuito combinatorio"]
- tipo: circuito-mux
- difficolta: media
- punteggio: 4 punti

**Testo:** (Compito 2 — Prima Parte)

(4 punti) Disegnare il circuito combinatorio che realizza la funzione f(x₁,x₂,x₃,x₄) = x₄·(x̄₁·x̄₂·x̄₃) + x̄₄·(x̄₂·x₃) facendo uso solo di multiplexer con 2 linee di controllo (selezione).

**Traccia di soluzione:**

Schema con MUX 4:1 disegnato nella fonte.

---

## Esercizio 18

- concetti: ["automa a stati finiti (FSM)", "rete sequenziale", "riconoscimento pattern"]
- tipo: fsm-sintesi
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 2 — Prima Parte)

(7 punti) Disegnare il diagramma di stato di una Rete Sequenziale a singolo ingresso (x) e singola uscita (z) che restituisca in un determinato istante i ≥ 0 uscita uguale a 1 se e solo la sequenza di bit finora letta coincide con un'alternanza completa dei bit 011

**Traccia di soluzione:**

FSM simile a Es.6-Compito1, con sequenza target 011. Diagramma disegnato nella fonte.

---

## Esercizio 19

- concetti: ["flip-flop SR", "progettazione rete sequenziale", "tabella delle transizioni"]
- tipo: fsm-progettazione
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 2 — Prima Parte)

(7 punti) Progettare la rete sequenziale corrispondente al seguente diagramma di stato (avente gli stati già codificati), utilizzando flip-flop di tipo SR. (Stesso diagramma del Compito 1.)

**Traccia di soluzione:**

s₁ = x  
s₂ = xȳ₂  
r₁ = x̄y₂  
r₂ = xy₂  
z = xȳ₂ + x̄y₂

---

<!-- ====== COMPITO 2 — SECONDA PARTE ====== -->

## Esercizio 20

- concetti: ["set di istruzioni (ISA)", "modello registro-registro", "esecuzione istruzioni"]
- tipo: esecuzione-istruzioni
- difficolta: bassa
- punteggio: 5 punti

**Testo:** (Compito 2 — Seconda Parte)

(5 punti) Cosa contengono i registri R1 e R2 dopo la seguente sequenza di istruzioni?  
LDI R1,4 – LDI R2,10 – MUL R1,R1,R2 – ADD R2,R1,R2 – SUB R1,R2,R1

**Traccia di soluzione:**

R1 = 10, R2 = 50

---

## Esercizio 21

- concetti: ["prestazioni CPU", "frequenza di clock", "CPI", "tempo di esecuzione"]
- tipo: cpi-prestazioni
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 2 — Seconda Parte)

(5 punti) Si assuma che un calcolatore esegua 4 tipi diversi di operazioni. Nella seguente tabella sono descritte le operazioni, il numero di cicli di clock necessari ad eseguirle (c_i) e il numero di volte che vengono eseguite da un dato programma:

| Tipo Istruzione     | c_i | Numero di esecuzioni |
|---------------------|-----|----------------------|
| Addizione           | 2   | 3·10⁶                |
| Moltiplicazione     | 3   | 2·10⁶                |
| Accesso in Memoria  | 5   | 5·10⁶                |
| Salti Condizionati  | 4   | 6·10⁶                |

Calcolare la frequenza di clock necessaria per eseguire il suddetto programma in 3 secondi.

**Traccia di soluzione:**

f ≈ 20,33 MHz

---

## Esercizio 22

- concetti: ["modello registro-registro", "assembler", "istruzioni aritmetiche"]
- tipo: assembler
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 2 — Seconda Parte)

(5 punti) Determinare la sequenza di istruzioni assembler che realizzano lo statement di alto livello x = a³/c² nel modello registro-registro

**Traccia di soluzione:**

```
LD  R1, A
LD  R2, C
MUL R3, R1, R1    ; R3 = a²
MUL R3, R3, R1    ; R3 = a³
MUL R2, R2, R2    ; R2 = c²
DIV R3, R3, R2    ; R3 = a³/c²
ST  X, R3
```

---

## Esercizio 23

- concetti: ["microprogrammazione", "microoperazioni", "segnali di controllo", "execute istruzione"]
- tipo: microprogrammazione
- difficolta: alta
- punteggio: 9 punti

**Testo:** (Compito 2 — Seconda Parte)

(9 punti) Determinare la fase di execute dell'istruzione CP2 V,(RA) che ha l'effetto di copiare il contenuto della locazione di memoria il cui indirizzo è contenuto in RA nella locazione di memoria di indirizzo simbolico V, assumendo che nel formato in linguaggio macchina i 6 bit più significativi siano dedicati al codice operativo, i 5 bit successivi alla specifica del registro RA e i 21 bit meno significativi alla specifica dell'indirizzo V.

**Traccia di soluzione:**

| Ciclo | Segnali di Controllo |
|-------|----------------------|
| T5    | RA_out, MAR_in |
| T6    | MRD |
| T7    | MRD, DTR_in |
| T8    | O^m\|IR[20:0]_out, MAR_in |
| T9    | MWR, SELDTR_dir, DTR_out |
| T10   | MWR, SELDTR_dir, DTR_out |

---

## Esercizio 24

- concetti: ["legge di Amdahl", "accelerazione", "prestazioni sistema"]
- tipo: amdahl
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 2 — Seconda Parte)

(6 punti) In riferimento alla legge di Amdahl, si calcoli l'accelerazione di una data componente necessaria per far sì che l'accelerazione complessiva del sistema sia pari a 1,2, assumendo che la frequenza di utilizzo di tale componente sia pari a 1/4.

**Traccia di soluzione:**

A_comp = 3

---

<!-- ====== COMPITO 3 — PRIMA PARTE ====== -->

## Esercizio 25

- concetti: ["complemento a 2", "rappresentazione interi"]
- tipo: codifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 3 — Prima Parte)

(2 punti) Codificare i numeri interi (a) -69 e (b) 87 in complemento a 2 a 8 bit

**Traccia di soluzione:**

(a) -69 → 10111011  
(b) 87 → 01010111

---

## Esercizio 26

- concetti: ["modulo e segno"]
- tipo: decodifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 3 — Prima Parte)

(2 punti) Determinare i numeri interi rappresentati dalle sequenze di bit (a) 1110111001 e (b) 1001101101 nella notazione in modulo e segno

**Traccia di soluzione:**

(a) 1110111001 → -441  
(b) 1001101101 → -108 (valore letto dalla fonte: -108)

---

## Esercizio 27

- concetti: ["conversione di base"]
- tipo: conversione-basi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 3 — Prima Parte)

(2 punti) Convertire da base 16 a base 8 i seguenti numeri naturali

**(a)** 8BF3  
**(b)** C5A9

**Traccia di soluzione:**

(a) 8BF3 → 105763₈  
(b) C5A9 → 142651₈

---

## Esercizio 28

- concetti: ["mappe di Karnaugh", "SOP minimale", "funzioni booleane"]
- tipo: karnaugh-sop
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 3 — Prima Parte)

(6 punti) Determinare la forma SOP minimale della funzione booleana avente la seguente tabella di verità utilizzando il metodo delle mappe di Karnaugh:

| x₁ | x₂ | x₃ | x₄ | f |
|----|----|----|----|----|
| 0  | 0  | 0  | 0  | 1  |
| 0  | 0  | 0  | 1  | 1  |
| 0  | 0  | 1  | 0  | 1  |
| 0  | 0  | 1  | 1  | 0  |
| 0  | 1  | 0  | 0  | 1  |
| 0  | 1  | 0  | 1  | −  |
| 0  | 1  | 1  | 0  | 1  |
| 0  | 1  | 1  | 1  | 0  |
| 1  | 0  | 0  | 0  | 1  |
| 1  | 0  | 0  | 1  | 0  |
| 1  | 0  | 1  | 0  | 1  |
| 1  | 0  | 1  | 1  | −  |
| 1  | 1  | 0  | 0  | −  |
| 1  | 1  | 0  | 1  | 0  |
| 1  | 1  | 1  | 0  | 0  |
| 1  | 1  | 1  | 1  | 0  |

**Traccia di soluzione:**

SOP = x̄₂x̄₄ + x̄₁x̄₃ + x₂x̄₃ + x̄₁x̄₄

---

## Esercizio 29

- concetti: ["multiplexer", "circuito combinatorio"]
- tipo: circuito-mux
- difficolta: media
- punteggio: 4 punti

**Testo:** (Compito 3 — Prima Parte)

(4 punti) Disegnare il circuito combinatorio che realizza la funzione f(x₁,x₂,x₃,x₄) = x̄₂·(x̄₄·x₁) + x₂·(x̄₃·x₄·x̄₁) facendo uso solo di multiplexer con 2 linee di controllo (selezione).

**Traccia di soluzione:**

Schema con MUX 4:1 disegnato nella fonte.

---

## Esercizio 30

- concetti: ["automa a stati finiti (FSM)", "rete sequenziale", "riconoscimento pattern"]
- tipo: fsm-sintesi
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 3 — Prima Parte)

(7 punti) Disegnare il diagramma di stato di una Rete Sequenziale a singolo ingresso (x) e singola uscita (z) che restituisca in un determinato istante i ≥ 0 uscita uguale a 1 se e solo la sequenza di bit finora letta coincide con un'alternanza completa dei bit 110

**Traccia di soluzione:**

FSM con sequenza target 110. Diagramma disegnato nella fonte.

---

## Esercizio 31

- concetti: ["flip-flop SR", "progettazione rete sequenziale", "tabella delle transizioni"]
- tipo: fsm-progettazione
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 3 — Prima Parte)

(7 punti) Progettare la rete sequenziale corrispondente al seguente diagramma di stato (avente gli stati già codificati), utilizzando flip-flop di tipo SR. (Stesso diagramma del Compito 1.)

**Traccia di soluzione:**

s₁ = xȳ₁  
s₂ = y₁  
r₁ = xy₁  
r₂ = xȳ₁  
z = x̄y₁ + xȳ₁

---

<!-- ====== COMPITO 3 — SECONDA PARTE ====== -->

## Esercizio 32

- concetti: ["set di istruzioni (ISA)", "modello registro-registro", "esecuzione istruzioni"]
- tipo: esecuzione-istruzioni
- difficolta: bassa
- punteggio: 5 punti

**Testo:** (Compito 3 — Seconda Parte)

(5 punti) Cosa contengono i registri R1 e R2 dopo la seguente sequenza di istruzioni?  
LDI R1,2 – LDI R2,40 – MUL R1,R1,R2 – ADD R2,R1,R2 – SUB R1,R2,R1

**Traccia di soluzione:**

R1 = 40, R2 = 120

---

## Esercizio 33

- concetti: ["prestazioni CPU", "frequenza di clock", "CPI", "tempo di esecuzione"]
- tipo: cpi-prestazioni
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 3 — Seconda Parte)

(5 punti) Si assuma che un calcolatore esegua 4 tipi diversi di operazioni. Nella seguente tabella sono descritte le operazioni, il numero di cicli di clock necessari ad eseguirle (c_i) e il numero di volte che vengono eseguite da un dato programma:

| Tipo Istruzione     | c_i | Numero di esecuzioni |
|---------------------|-----|----------------------|
| Addizione           | 2   | 4·10⁶                |
| Moltiplicazione     | 4   | 3·10⁶                |
| Accesso in Memoria  | 5   | 2·10⁶                |
| Salti Condizionati  | 2   | 7·10⁶                |

Calcolare la frequenza di clock necessaria per eseguire il suddetto programma in 4 secondi.

**Traccia di soluzione:**

f = 11 MHz

---

## Esercizio 34

- concetti: ["modello registro-registro", "assembler", "istruzioni aritmetiche"]
- tipo: assembler
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 3 — Seconda Parte)

(5 punti) Determinare la sequenza di istruzioni assembler che realizzano lo statement di alto livello x = a² − c³ nel modello registro-registro

**Traccia di soluzione:**

```
LD  R1, A
MUL R1, R1, R1    ; R1 = a²
LD  R2, C
MUL R3, R2, R2    ; R3 = c²
MUL R3, R3, R2    ; R3 = c³
SUB R3, R1, R3    ; R3 = a²−c³  (nota: istruzione è SUB R3,R1,R2 nella fonte)
ST  X, R3
```

---

## Esercizio 35

- concetti: ["microprogrammazione", "microoperazioni", "segnali di controllo", "execute istruzione"]
- tipo: microprogrammazione
- difficolta: alta
- punteggio: 9 punti

**Testo:** (Compito 3 — Seconda Parte)

(9 punti) Determinare la fase di execute dell'istruzione CP3 (RA),V che ha l'effetto di copiare il contenuto della locazione di memoria di indirizzo simbolico V nella locazione di memoria il cui indirizzo è contenuto in RA. (Stessa semantica di CP1, stesso formato.)

**Traccia di soluzione:**

| Ciclo | Segnali di Controllo |
|-------|----------------------|
| T5    | O^m\|IR[20:0]_out, MAR_in |
| T6    | MRD |
| T7    | MRD, DTR_in |
| T8    | RA_out, MAR_in |
| T9    | MWR, SELDTR_dir, DTR_out |
| T10   | MWR, SELDTR_dir, DTR_out |

---

## Esercizio 36

- concetti: ["legge di Amdahl", "accelerazione", "prestazioni sistema"]
- tipo: amdahl
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 3 — Seconda Parte)

(6 punti) In riferimento alla legge di Amdahl, si calcoli l'accelerazione di una data componente necessaria per far sì che l'accelerazione complessiva del sistema sia pari a 1,3, assumendo che la frequenza di utilizzo di tale componente sia pari a 1/3.

**Traccia di soluzione:**

A_comp = 13/4

---

<!-- ====== COMPITO 4 — PRIMA PARTE ====== -->

## Esercizio 37

- concetti: ["complemento a 2", "rappresentazione interi"]
- tipo: codifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 4 — Prima Parte)

(2 punti) Codificare i numeri interi (a) -95 e (b) 49 in complemento a 2 a 8 bit

**Traccia di soluzione:**

(a) -95 → 10100001  
(b) 49 → 00110001

---

## Esercizio 38

- concetti: ["modulo e segno"]
- tipo: decodifica-interi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 4 — Prima Parte)

(2 punti) Determinare i numeri interi rappresentati dalle sequenze di bit (a) 1011010011 e (b) 1100111011 nella notazione in modulo e segno

**Traccia di soluzione:**

(a) 1011010011 → -211  
(b) 1100111011 → -315

---

## Esercizio 39

- concetti: ["conversione di base"]
- tipo: conversione-basi
- difficolta: bassa
- punteggio: 2 punti

**Testo:** (Compito 4 — Prima Parte)

(2 punti) Convertire da base 8 a base 16 i seguenti numeri naturali

**(a)** 36217  
**(b)** 74053

**Traccia di soluzione:**

(a) 36217₈ → 3C8F₁₆  
(b) 74053₈ → 782B₁₆

---

## Esercizio 40

- concetti: ["mappe di Karnaugh", "SOP minimale", "funzioni booleane"]
- tipo: karnaugh-sop
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 4 — Prima Parte)

(6 punti) Determinare la forma SOP minimale della funzione booleana avente la seguente tabella di verità utilizzando il metodo delle mappe di Karnaugh:

| x₁ | x₂ | x₃ | x₄ | f |
|----|----|----|----|----|
| 0  | 0  | 0  | 0  | 1  |
| 0  | 0  | 0  | 1  | −  |
| 0  | 0  | 1  | 0  | 1  |
| 0  | 0  | 1  | 1  | 1  |
| 0  | 1  | 0  | 0  | 0  |
| 0  | 1  | 0  | 1  | 1  |
| 0  | 1  | 1  | 0  | 1  |
| 0  | 1  | 1  | 1  | −  |
| 1  | 0  | 0  | 0  | 1  |
| 1  | 0  | 0  | 1  | 0  |
| 1  | 0  | 1  | 0  | 1  |
| 1  | 0  | 1  | 1  | 1  |
| 1  | 1  | 0  | 0  | −  |
| 1  | 1  | 0  | 1  | 0  |
| 1  | 1  | 1  | 0  | 0  |
| 1  | 1  | 1  | 1  | 0  |

**Traccia di soluzione:**

SOP = x̄₂x̄₄ + x̄₁x̄₄ + x̄₁x₃ + x̄₂x₃

---

## Esercizio 41

- concetti: ["multiplexer", "circuito combinatorio"]
- tipo: circuito-mux
- difficolta: media
- punteggio: 4 punti

**Testo:** (Compito 4 — Prima Parte)

(4 punti) Disegnare il circuito combinatorio che realizza la funzione f(x₁,x₂,x₃,x₄) = x₂·(x̄₃·x̄₄·x̄₁) + x̄₂·(x̄₄·x₁) facendo uso solo di multiplexer con 2 linee di controllo (selezione).

**Traccia di soluzione:**

Schema con MUX 4:1 disegnato nella fonte.

---

## Esercizio 42

- concetti: ["automa a stati finiti (FSM)", "rete sequenziale", "riconoscimento pattern"]
- tipo: fsm-sintesi
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 4 — Prima Parte)

(7 punti) Disegnare il diagramma di stato di una Rete Sequenziale a singolo ingresso (x) e singola uscita (z) che restituisca in un determinato istante i ≥ 0 uscita uguale a 1 se e solo la sequenza di bit finora letta coincide con un'alternanza completa dei bit 101

**Traccia di soluzione:**

FSM con sequenza target 101. Diagramma disegnato nella fonte.

---

## Esercizio 43

- concetti: ["flip-flop SR", "progettazione rete sequenziale", "tabella delle transizioni"]
- tipo: fsm-progettazione
- difficolta: alta
- punteggio: 7 punti

**Testo:** (Compito 4 — Prima Parte)

(7 punti) Progettare la rete sequenziale corrispondente al seguente diagramma di stato (avente gli stati già codificati), utilizzando flip-flop di tipo SR. (Stesso diagramma del Compito 1.)

**Traccia di soluzione:**

s₁ = y₂  
s₂ = xȳ₂  
r₁ = xȳ₂  
r₂ = xy₂  
z = x̄y₂ + xȳ₂

---

<!-- ====== COMPITO 4 — SECONDA PARTE ====== -->

## Esercizio 44

- concetti: ["set di istruzioni (ISA)", "modello registro-registro", "esecuzione istruzioni"]
- tipo: esecuzione-istruzioni
- difficolta: bassa
- punteggio: 5 punti

**Testo:** (Compito 4 — Seconda Parte)

(5 punti) Cosa contengono i registri R1 e R2 dopo la seguente sequenza di istruzioni?  
LDI R1,4 – LDI R2,30 – MUL R1,R1,R2 – ADD R2,R1,R2 – SUB R1,R2,R1

**Traccia di soluzione:**

R1 = 30, R2 = 150

---

## Esercizio 45

- concetti: ["prestazioni CPU", "frequenza di clock", "CPI", "tempo di esecuzione"]
- tipo: cpi-prestazioni
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 4 — Seconda Parte)

(5 punti) Si assuma che un calcolatore esegua 4 tipi diversi di operazioni. Nella seguente tabella sono descritte le operazioni, il numero di cicli di clock necessari ad eseguirle (c_i) e il numero di volte che vengono eseguite da un dato programma:

| Tipo Istruzione     | c_i | Numero di esecuzioni |
|---------------------|-----|----------------------|
| Addizione           | 2   | 3·10⁶                |
| Moltiplicazione     | 3   | 3·10⁶                |
| Accesso in Memoria  | 4   | 7·10⁶                |
| Salti Condizionati  | 2   | 6·10⁶                |

Calcolare la frequenza di clock necessaria per eseguire il suddetto programma in 5 secondi.

**Traccia di soluzione:**

f = 11 MHz

---

## Esercizio 46

- concetti: ["modello registro-registro", "assembler", "istruzioni aritmetiche"]
- tipo: assembler
- difficolta: media
- punteggio: 5 punti

**Testo:** (Compito 4 — Seconda Parte)

(5 punti) Determinare la sequenza di istruzioni assembler che realizzano lo statement di alto livello x = a³ − c² nel modello registro-registro

**Traccia di soluzione:**

```
LD  R1, A
LD  R2, B
MUL R3, R1, R1    ; R3 = a²
MUL R3, R3, R1    ; R3 = a³
MUL R2, R2, R2    ; R2 = c²  (nota: nel PDF B è usato al posto di C)
SUB R3, R3, R2
ST  X, R3
```

---

## Esercizio 47

- concetti: ["microprogrammazione", "microoperazioni", "segnali di controllo", "execute istruzione"]
- tipo: microprogrammazione
- difficolta: alta
- punteggio: 9 punti

**Testo:** (Compito 4 — Seconda Parte)

(9 punti) Determinare la fase di execute dell'istruzione CP4 V,(RA) che ha l'effetto di copiare il contenuto della locazione di memoria il cui indirizzo è contenuto in RA nella locazione di memoria di indirizzo simbolico V. (Stessa semantica di CP2, stesso formato.)

**Traccia di soluzione:**

| Ciclo | Segnali di Controllo |
|-------|----------------------|
| T5    | RA_out, MAR_in |
| T6    | MRD |
| T7    | MRD |
| T8    | O^m\|IR[20:0]_out, MAR_in |
| T9    | MWR, SELDTR_dir, DTR_out |
| T10   | MWR, SELDTR_dir, DTR_out |

---

## Esercizio 48

- concetti: ["legge di Amdahl", "accelerazione", "prestazioni sistema"]
- tipo: amdahl
- difficolta: media
- punteggio: 6 punti

**Testo:** (Compito 4 — Seconda Parte)

(6 punti) In riferimento alla legge di Amdahl, si calcoli l'accelerazione di una data componente necessaria per far sì che l'accelerazione complessiva del sistema sia pari a 1,4, assumendo che la frequenza di utilizzo di tale componente sia pari a 1/2.

**Traccia di soluzione:**

A_comp = 7/3
