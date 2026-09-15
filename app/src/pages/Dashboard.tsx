import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, PipelineMateria, StatoResponse } from '../lib/api';

// La dashboard è l'hub: non solo lo stato delle flashcard, ma una vista su
// ogni fase della pipeline di studio (cattura → schematizza → flashcard →
// cura → ripasso, più compattazione/esami quando saranno implementate),
// con scorciatoie dirette a ciò che c'è da fare (vedi feedback utente:
// "tutte le cose che può fare e tutto quello che deve fare").
export function Dashboard() {
  const [stato, setStato] = useState<StatoResponse | null>(null);
  const [pipeline, setPipeline] = useState<PipelineMateria[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.stato(), api.pipeline()])
      .then(([s, p]) => {
        setStato(s);
        setPipeline(p.materie);
      })
      .catch((e) => setErrore(e.message));
  }, []);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!stato || !pipeline) return <p>Caricamento…</p>;

  const totDovute = stato.materie.reduce((s, m) => s + m.dovute, 0);
  const totNuove = stato.materie.reduce((s, m) => s + m.nuove, 0);
  const totProposta = stato.materie.reduce((s, m) => s + m.proposta, 0);

  return (
    <div className="pagina">
      <h1>Dashboard</h1>
      <p className="sottotitolo">{stato.oggi}</p>

      <div className="azioni-rapide">
        {totDovute + totNuove > 0 ? (
          <Link className="bottone-grande" to="/active-recall?tab=ripassa">
            Ripassa ora — {totDovute} da rivedere, {totNuove} nuove
          </Link>
        ) : (
          <p className="tutto-fatto">Ripasso di oggi completato. 🎉</p>
        )}
        {totProposta > 0 && (
          <Link className="bottone-secondario" to="/active-recall?tab=cura">
            {totProposta} carte da curare
          </Link>
        )}
        <Link className="bottone-secondario" to="/concetti">
          Esplora i concetti
        </Link>
      </div>

      <div className="griglia-materie">
        {stato.materie.map((m) => {
          const p = pipeline.find((x) => x.slug === m.slug);
          return (
            <div key={m.slug} className="scheda-materia">
              <div className="scheda-materia-intestazione">
                <h2>{m.nome}</h2>
                {m.data_esame && <span className="countdown">Esame: {m.data_esame}</span>}
              </div>

              {p && <PipelineStrip slug={m.slug} p={p} />}

              <div className="scheda-materia-azioni">
                <Link className="chip-azione" to={`/materiali?materia=${m.slug}`}>
                  Materiali
                </Link>
                <Link
                  className={`chip-azione ${p && p.ripasso.dovute + p.ripasso.nuove > 0 ? 'evidenzia' : ''}`}
                  to={`/active-recall?tab=ripassa&materia=${m.slug}`}
                >
                  Ripassa {p ? p.ripasso.dovute + p.ripasso.nuove : ''}
                </Link>
                <Link
                  className={`chip-azione ${p && p.cura.daCurare > 0 ? 'evidenzia' : ''}`}
                  to={`/active-recall?tab=cura&materia=${m.slug}`}
                >
                  Cura {p ? p.cura.daCurare : ''}
                </Link>
                <Link className="chip-azione" to={`/concetti?materia=${m.slug}`}>
                  Concetti
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Striscia delle 6 fasi dello studio (PIANO.md §2): le prime tre sono
// guidate da skill Claude Code (cattura, schematizza) o già interattive
// nella web app (flashcard/cura/ripasso); compattazione ed esami sono
// segnaposto — la fase esiste nel piano ma non ha ancora un'interfaccia,
// e va detto chiaramente invece di nasconderla.
function PipelineStrip({ slug, p }: { slug: string; p: PipelineMateria }) {
  const fasi: { label: string; count: number; nota?: string }[] = [
    { label: 'Cattura', count: p.cattura.daProcessare, nota: 'clicca per caricare o lanciare /cattura' },
    { label: 'Schematizza', count: p.schematizza.daSchematizzare, nota: 'clicca per schematizzare le lezioni grezze' },
    { label: 'Flashcard', count: p.flashcard.concettiSenzaCarte, nota: 'concetti senza carte — clicca per generarle' },
  ];
  return (
    <div className="pipeline-strip">
      {fasi.map((f) => (
        <Link
          key={f.label}
          to={`/materiali?materia=${slug}`}
          className={`pipeline-fase ${f.count > 0 ? 'attenzione' : 'ok'}`}
          title={f.nota}
        >
          <span className="pipeline-numero">{f.count}</span>
          <span className="pipeline-label">{f.label}</span>
        </Link>
      ))}
      <div className="pipeline-fase pipeline-futura" title="Fase 5 del piano, non ancora implementata">
        <span className="pipeline-numero">—</span>
        <span className="pipeline-label">Compattazione</span>
      </div>
      <div className="pipeline-fase pipeline-futura" title="Fase 6 del piano, non ancora implementata">
        <span className="pipeline-numero">—</span>
        <span className="pipeline-label">Esami</span>
      </div>
    </div>
  );
}
