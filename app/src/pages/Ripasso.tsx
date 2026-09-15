import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, Carta } from '../lib/api';
import { MathText } from '../components/MathText';

// Schermata di ripasso: tutto da tastiera (vedi PIANO.md §4).
// Spazio/Invio = rivela risposta, 1-4 = valutazione, s = sospendi.
export function Ripasso() {
  const [params] = useSearchParams();
  const materiaFiltro = params.get('materia') || undefined;

  const [carte, setCarte] = useState<Carta[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [rivelata, setRivelata] = useState(false);
  const [fatte, setFatte] = useState(0);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    api
      .sessione(materiaFiltro)
      .then((r) => setCarte(r.carte))
      .catch((e) => setErrore(e.message));
  }, [materiaFiltro]);

  const carta = carte && indice < carte.length ? carte[indice] : null;

  const rivela = useCallback(() => setRivelata(true), []);

  const valuta = useCallback(
    async (voto: 1 | 2 | 3 | 4) => {
      if (!carta) return;
      await api.valuta(carta.srsId, carta.materia, carta.concetto, voto);
      setFatte((n) => n + 1);
      setRivelata(false);
      setIndice((i) => i + 1);
    },
    [carta]
  );

  const sospendi = useCallback(async () => {
    if (!carta) return;
    await api.sospendi(carta.srsId);
    setRivelata(false);
    setIndice((i) => i + 1);
  }, [carta]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!carta) return;
      if (!rivelata) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          rivela();
        }
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) {
        valuta(Number(e.key) as 1 | 2 | 3 | 4);
      } else if (e.key.toLowerCase() === 's') {
        sospendi();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [carta, rivelata, rivela, valuta, sospendi]);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!carte) return <p>Caricamento…</p>;

  if (!carta) {
    return (
      <div className="pagina pagina-centrata">
        <h1>{fatte > 0 ? 'Sessione completata! 🎉' : 'Tutto ripassato per oggi. 🎉'}</h1>
        {fatte > 0 && <p>{fatte} carte ripassate.</p>}
        <Link className="bottone-grande" to="/">
          Torna alla dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pagina pagina-centrata">
      <p className="progresso">
        {indice + 1} / {carte.length} · {carta.materiaNome} · {carta.concetto}
      </p>

      <div className="carta">
        <div className="domanda">
          <MathText text={carta.domanda} />
        </div>

        {rivelata && (
          <>
            <hr />
            <div className="risposta">
              <MathText text={carta.risposta} />
            </div>
          </>
        )}
      </div>

      {!rivelata ? (
        <button className="bottone-grande" onClick={rivela} autoFocus>
          Mostra risposta <span className="tasto">Spazio</span>
        </button>
      ) : (
        <div className="valutazione">
          <button className="voto voto-1" onClick={() => valuta(1)}>
            Again <span className="tasto">1</span>
          </button>
          <button className="voto voto-2" onClick={() => valuta(2)}>
            Hard <span className="tasto">2</span>
          </button>
          <button className="voto voto-3" onClick={() => valuta(3)}>
            Good <span className="tasto">3</span>
          </button>
          <button className="voto voto-4" onClick={() => valuta(4)}>
            Easy <span className="tasto">4</span>
          </button>
        </div>
      )}

      <button className="link-minore" onClick={sospendi}>
        Sospendi questa carta (s)
      </button>
    </div>
  );
}
