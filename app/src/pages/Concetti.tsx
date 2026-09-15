import { useEffect, useState } from 'react';
import { api, Concetto } from '../lib/api';

// Browser dei concetti — versione minima (screen 3 del piano, §4): elenco
// filtrabile. Ricerca full-text e grafo dei prerequisiti restano per una
// iterazione successiva, non bloccano l'uso quotidiano dell'app.
export function Concetti() {
  const [concetti, setConcetti] = useState<Concetto[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    api.concetti().then(setConcetti).catch((e) => setErrore(e.message));
  }, []);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!concetti) return <p>Caricamento…</p>;

  const filtrati = concetti.filter(
    (c) =>
      c.titolo?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.id?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.tag?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="pagina">
      <h1>Concetti</h1>
      <input
        className="ricerca"
        placeholder="Cerca per titolo, ID o tag…"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <div className="tabella-scroll">
        <table className="tabella-concetti">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titolo</th>
              <th>Materia</th>
              <th>Tipo</th>
              <th>Stato</th>
              <th>Confidenza</th>
            </tr>
          </thead>
          <tbody>
            {filtrati.map((c) => (
              <tr key={c.id} className={`stato-${c.stato}`}>
                <td className="mono">{c.id}</td>
                <td>{c.titolo}</td>
                <td>{c.materia}</td>
                <td>{c.tipo}</td>
                <td>{c.stato}</td>
                <td>
                  <span className="barra-confidenza" style={{ '--val': c.confidenza } as React.CSSProperties} />
                  {c.confidenza}/5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtrati.length === 0 && <p>Nessun concetto trovato.</p>}
    </div>
  );
}
