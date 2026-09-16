import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, Carta, MateriaStato } from '../lib/api';
import { MathText } from '../components/MathText';

// Active Recall: Ripasso e Cura erano due schermate separate, accorpate
// qui in un'unica sezione a due tab — sono due momenti dello stesso ciclo
// (curare ciò che /genera-flashcard propone, poi ripassarlo), non due
// funzioni indipendenti (vedi feedback utente sulla UI).
type Tab = 'ripassa' | 'cura';

export function ActiveRecall() {
  const [params, setParams] = useSearchParams();
  const materiaFiltro = params.get('materia') || undefined;
  const tab = (params.get('tab') as Tab) || 'ripassa';

  const [materie, setMaterie] = useState<MateriaStato[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    api.stato().then((r) => setMaterie(r.materie)).catch((e) => setErrore(e.message));
  }, []);

  function setTab(t: Tab) {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    setParams(next, { replace: true });
  }

  function setMateria(slug: string) {
    const next = new URLSearchParams(params);
    if (slug) next.set('materia', slug);
    else next.delete('materia');
    setParams(next, { replace: true });
  }

  const totRipassa = useMemo(
    () => (materie || []).filter((m) => !materiaFiltro || m.slug === materiaFiltro).reduce((s, m) => s + m.dovute + m.nuove, 0),
    [materie, materiaFiltro]
  );
  const totCura = useMemo(
    () => (materie || []).filter((m) => !materiaFiltro || m.slug === materiaFiltro).reduce((s, m) => s + m.proposta, 0),
    [materie, materiaFiltro]
  );

  return (
    <div className="pagina">
      <h1>Studia</h1>
      <div className="barra-controlli">
        <div className="tabs">
          <button className={tab === 'ripassa' ? 'tab attiva' : 'tab'} onClick={() => setTab('ripassa')}>
            Ripassa {materie && `(${totRipassa})`}
          </button>
          <button className={tab === 'cura' ? 'tab attiva' : 'tab'} onClick={() => setTab('cura')}>
            Cura {materie && `(${totCura})`}
          </button>
        </div>
        {materie && (
          <select className="select-materia" value={materiaFiltro || ''} onChange={(e) => setMateria(e.target.value)}>
            <option value="">Tutte le materie</option>
            {materie.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {errore && <p className="errore">Errore: {errore}</p>}
      {tab === 'ripassa' ? <PannelloRipassa materiaFiltro={materiaFiltro} /> : <PannelloCura materiaFiltro={materiaFiltro} />}
    </div>
  );
}

function PannelloRipassa({ materiaFiltro }: { materiaFiltro?: string }) {
  const [carte, setCarte] = useState<Carta[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [rivelata, setRivelata] = useState(false);
  const [fatte, setFatte] = useState(0);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    setCarte(null);
    setIndice(0);
    setFatte(0);
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
      const target = e.target as HTMLElement;
      if (target && ['SELECT', 'INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (!rivelata) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          rivela();
        }
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) valuta(Number(e.key) as 1 | 2 | 3 | 4);
      else if (e.key.toLowerCase() === 's') sospendi();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [carta, rivelata, rivela, valuta, sospendi]);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!carte) return <p>Caricamento…</p>;

  if (!carta) {
    return (
      <div className="pannello-centrato">
        <h2>{fatte > 0 ? 'Sessione completata' : 'Tutto ripassato per oggi'}</h2>
        {fatte > 0 && <p>{fatte} carte ripassate.</p>}
      </div>
    );
  }

  return (
    <div className="pannello-centrato">
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

function PannelloCura({ materiaFiltro }: { materiaFiltro?: string }) {
  const [proposte, setProposte] = useState<Carta[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [approvate, setApprovate] = useState(0);
  const [scartate, setScartate] = useState(0);

  useEffect(() => {
    setProposte(null);
    api.proposte(materiaFiltro).then(setProposte).catch((e) => setErrore(e.message));
  }, [materiaFiltro]);

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
      <p className="sottotitolo">
        Nessuna carta in attesa.
        {approvate + scartate > 0 && ` (${approvate} approvate, ${scartate} scartate in questa sessione)`}
      </p>
    );
  }

  return (
    <>
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
                Approva
              </button>
              <button className="scarta" onClick={() => decidi(c, 'scarta')}>
                Scarta
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
