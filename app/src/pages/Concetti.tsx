import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, Concetto } from '../lib/api';

// Esplorazione dei concetti raggruppata per materia, non un dump tabellare
// del database (vedi feedback utente): card con badge di copertura
// flashcard, per far emergere subito i concetti mai trasformati in carte.
export function Concetti() {
  const [params] = useSearchParams();
  const materiaIniziale = params.get('materia') || '';

  const [concetti, setConcetti] = useState<Concetto[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [soloSenzaCarte, setSoloSenzaCarte] = useState(false);
  const [materiaFiltro, setMateriaFiltro] = useState(materiaIniziale);

  useEffect(() => {
    api.concetti().then(setConcetti).catch((e) => setErrore(e.message));
  }, []);

  const gruppi = useMemo(() => {
    if (!concetti) return [];
    const f = concetti.filter((c) => {
      if (materiaFiltro && c.materia !== materiaFiltro) return false;
      if (soloSenzaCarte && c.numFlashcard > 0) return false;
      const q = filtro.toLowerCase();
      return !q || c.titolo?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q) || c.tag?.toLowerCase().includes(q);
    });
    const perMateria = new Map<string, Concetto[]>();
    for (const c of f) {
      if (!perMateria.has(c.materia)) perMateria.set(c.materia, []);
      perMateria.get(c.materia)!.push(c);
    }
    return [...perMateria.entries()];
  }, [concetti, filtro, soloSenzaCarte, materiaFiltro]);

  const materieDisponibili = useMemo(() => [...new Set((concetti || []).map((c) => c.materia))], [concetti]);
  const senzaCarteTotale = useMemo(() => (concetti || []).filter((c) => c.numFlashcard === 0).length, [concetti]);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!concetti) return <p>Caricamento…</p>;

  return (
    <div className="pagina">
      <h1>Concetti</h1>
      <p className="sottotitolo">
        {concetti.length} concetti · {senzaCarteTotale} senza flashcard
      </p>

      <div className="barra-controlli">
        <input
          className="ricerca"
          placeholder="Cerca per titolo, ID o tag…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <select className="select-materia" value={materiaFiltro} onChange={(e) => setMateriaFiltro(e.target.value)}>
          <option value="">Tutte le materie</option>
          {materieDisponibili.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button className={soloSenzaCarte ? 'chip-filtro attiva' : 'chip-filtro'} onClick={() => setSoloSenzaCarte((v) => !v)}>
          Solo senza flashcard
        </button>
      </div>

      {gruppi.length === 0 && <p>Nessun concetto trovato.</p>}

      {gruppi.map(([materia, lista]) => (
        <section key={materia} className="gruppo-materia">
          <h2 className="gruppo-titolo">{materia}</h2>
          <div className="griglia-concetti">
            {lista.map((c) => (
              <div key={c.id} className={`scheda-concetto stato-${c.stato}`}>
                <div className="scheda-concetto-intestazione">
                  <span className="mono">{c.id}</span>
                  {c.stato === 'bozza' && <span className="badge-bozza">bozza</span>}
                </div>
                <p className="scheda-concetto-titolo">{c.titolo}</p>
                <div className="scheda-concetto-meta">
                  <span>{c.tipo}</span>
                  {c.tag && <span className="tag">{c.tag}</span>}
                </div>
                <div className="scheda-concetto-footer">
                  <span className="barra-confidenza" style={{ '--val': c.confidenza } as React.CSSProperties} />
                  <span className="nota">{c.confidenza}/5</span>
                  <span className={c.numFlashcard === 0 ? 'badge-copertura vuota' : 'badge-copertura'}>
                    {c.numFlashcard === 0 ? '⚠ nessuna carta' : `${c.numFlashcard} carte`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
