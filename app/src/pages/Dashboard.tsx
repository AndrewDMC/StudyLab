import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, StatoResponse } from '../lib/api';

export function Dashboard() {
  const [stato, setStato] = useState<StatoResponse | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    api.stato().then(setStato).catch((e) => setErrore(e.message));
  }, []);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!stato) return <p>Caricamento…</p>;

  const totDovute = stato.materie.reduce((s, m) => s + m.dovute, 0);
  const totNuove = stato.materie.reduce((s, m) => s + m.nuove, 0);
  const totProposta = stato.materie.reduce((s, m) => s + m.proposta, 0);

  return (
    <div className="pagina">
      <h1>Dashboard</h1>
      <p className="sottotitolo">{stato.oggi}</p>

      {totDovute + totNuove > 0 ? (
        <Link className="bottone-grande" to="/ripasso">
          Ripassa ora — {totDovute} da rivedere, {totNuove} nuove
        </Link>
      ) : (
        <p className="tutto-fatto">Tutto ripassato per oggi. 🎉</p>
      )}

      {totProposta > 0 && (
        <Link className="bottone-secondario" to="/cura">
          {totProposta} carte da curare
        </Link>
      )}

      <div className="griglia-materie">
        {stato.materie.map((m) => (
          <div key={m.slug} className="scheda-materia">
            <h2>{m.nome}</h2>
            <dl>
              <div>
                <dt>Attive</dt>
                <dd>{m.attive}</dd>
              </div>
              <div>
                <dt>Dovute oggi</dt>
                <dd className={m.dovute > 0 ? 'evidenzia' : ''}>{m.dovute}</dd>
              </div>
              <div>
                <dt>Nuove disponibili</dt>
                <dd>
                  {m.nuove} <span className="nota">(cap {m.capNuoveAlGiorno}/giorno)</span>
                </dd>
              </div>
              <div>
                <dt>Da curare</dt>
                <dd>{m.proposta}</dd>
              </div>
              <div>
                <dt>Sospese</dt>
                <dd>{m.sospesa}</dd>
              </div>
            </dl>
            {m.data_esame && <p className="countdown">Esame: {m.data_esame}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
