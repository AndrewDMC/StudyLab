import { useEffect, useState } from 'react';
import { api, Carta } from '../lib/api';
import { MathText } from '../components/MathText';

// Curazione delle carte "proposta" generate da /genera-flashcard (Fase 2).
// La curazione non è opzionale (vedi PIANO.md §2 e §6): questa schermata
// esiste apposta per renderla comoda quanto il ripasso stesso.
export function Cura() {
  const [proposte, setProposte] = useState<Carta[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [approvate, setApprovate] = useState(0);
  const [scartate, setScartate] = useState(0);

  useEffect(() => {
    api.proposte().then(setProposte).catch((e) => setErrore(e.message));
  }, []);

  async function decidi(c: Carta, azione: 'approva' | 'scarta') {
    await api.cura(c.srsId, azione);
    setProposte((prev) => (prev ? prev.filter((x) => x.srsId !== c.srsId) : prev));
    if (azione === 'approva') setApprovate((n) => n + 1);
    else setScartate((n) => n + 1);
  }

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!proposte) return <p>Caricamento…</p>;

  if (proposte.length === 0) {
    return (
      <div className="pagina">
        <h1>Curazione</h1>
        <p>
          Nessuna carta in attesa.
          {approvate + scartate > 0 && ` (${approvate} approvate, ${scartate} scartate in questa sessione)`}
        </p>
      </div>
    );
  }

  return (
    <div className="pagina">
      <h1>Curazione</h1>
      <p className="sottotitolo">{proposte.length} carte in attesa — cancella senza pietà quelle deboli.</p>

      <div className="lista-cura">
        {proposte.map((c) => (
          <div key={c.srsId} className="riga-cura">
            <div className="riga-cura-testo">
              <p className="riga-cura-meta">
                {c.materiaNome} · {c.concetto}
              </p>
              <p className="riga-cura-domanda">
                <MathText text={c.domanda} />
              </p>
              <p className="riga-cura-risposta">
                <MathText text={c.risposta} />
              </p>
            </div>
            <div className="riga-cura-azioni">
              <button className="approva" onClick={() => decidi(c, 'approva')}>
                ✓ Approva
              </button>
              <button className="scarta" onClick={() => decidi(c, 'scarta')}>
                ✕ Scarta
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
