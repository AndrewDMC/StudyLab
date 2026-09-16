import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, MateriaStato, PipelineMateria } from '../lib/api';

// "The Front Page": ogni materia si apre come la prima pagina di un
// giornale — l'azione più urgente è il titolo in grande, il resto va in
// una striscia informativa sotto la piega. Sostituisce la vecchia griglia
// a pari peso (pipeline strip + heatmap + countdown + 4 chip), che
// costringeva a leggere ogni cella per capire cosa fare (vedi feedback
// utente: "confusionario"). Vedi .impeccable/briefs/app-src.md.
export function Dashboard() {
  const [stato, setStato] = useState<{ materie: MateriaStato[] } | null>(null);
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
  if (!stato || !pipeline) return <p className="caricamento">Caricamento…</p>;

  if (stato.materie.length === 0) {
    return (
      <div className="dashboard-vuoto">
        <p>
          Nessuna materia ancora. Crea una cartella in <code>materie/</code> per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="stack-materie">
      {stato.materie.map((m) => {
        const p = pipeline.find((x) => x.slug === m.slug);
        return p ? <CardMateria key={m.slug} m={m} p={p} /> : null;
      })}
    </div>
  );
}

type Lead = { testo: string; href: string; secondario: string; ok: boolean };

// Priorità della testata (STORY del brief): ripasso dovuto batte tutto
// (è la cosa che degrada se rimandata), poi cura, poi le fasi a monte
// della pipeline nell'ordine in cui lo studente le percorre dopo lezione.
function calcLead(p: PipelineMateria, slug: string): Lead {
  const totRipasso = p.ripasso.dovute + p.ripasso.nuove;
  if (totRipasso > 0) {
    return {
      testo: `${totRipasso} carte da ripassare`,
      href: `/active-recall?tab=ripassa&materia=${slug}`,
      secondario: p.cura.daCurare > 0 ? `+ ${p.cura.daCurare} carte da curare` : '',
      ok: false,
    };
  }
  if (p.cura.daCurare > 0) {
    return {
      testo: `${p.cura.daCurare} carte da curare`,
      href: `/active-recall?tab=cura&materia=${slug}`,
      secondario: '',
      ok: false,
    };
  }
  if (p.cattura.daProcessare > 0) {
    return {
      testo: `${p.cattura.daProcessare} lezioni grezze`,
      href: `/materiali?materia=${slug}`,
      secondario: p.schematizza.daSchematizzare > 0 ? `${p.schematizza.daSchematizzare} da schematizzare` : '',
      ok: false,
    };
  }
  if (p.schematizza.daSchematizzare > 0) {
    return {
      testo: `${p.schematizza.daSchematizzare} da schematizzare`,
      href: `/materiali?materia=${slug}`,
      secondario: '',
      ok: false,
    };
  }
  if (p.flashcard.concettiSenzaCarte > 0) {
    return {
      testo: `${p.flashcard.concettiSenzaCarte} concetti senza flashcard`,
      href: `/materiali?materia=${slug}`,
      secondario: 'Genera le carte dai concetti scoperti',
      ok: false,
    };
  }
  return {
    testo: 'Tutto a posto',
    href: `/concetti?materia=${slug}`,
    secondario: `${p.heatmapConfidenza.length} concetti attivi`,
    ok: true,
  };
}

function CardMateria({ m, p }: { m: MateriaStato; p: PipelineMateria }) {
  const lead = calcLead(p, m.slug);
  const totPipeline = p.cattura.daProcessare + p.schematizza.daSchematizzare + p.flashcard.concettiSenzaCarte;
  const totConcetti = p.heatmapConfidenza.length;
  const totEsami = p.esami.estratti;

  const giorni = m.giorniAllEsame;
  const countdownClass = giorni === null || giorni < 0 ? '' : giorni <= 7 ? 'urgente' : giorni <= 30 ? 'vicino' : '';
  const countdownTesto =
    giorni === null ? null : giorni < 0 ? 'Esame passato' : giorni === 0 ? 'Esame oggi' : `Esame tra ${giorni}g`;

  return (
    <article className="card-materia">
      <div className="card-intestazione">
        <h2 className="card-nome">{m.nome}</h2>
        {countdownTesto && (
          <span className={`card-countdown-badge ${countdownClass}`} title={m.data_esame || undefined}>
            {countdownTesto}
          </span>
        )}
      </div>

      <hr className="card-rule" />

      <Link to={lead.href} className={`card-lead${lead.ok ? ' ok' : ''}`}>
        {lead.testo}
      </Link>
      <p className="card-secondario">{lead.secondario || ' '}</p>

      <div className="card-info-strip">
        <div>
          <span className="info-col-label">Pipeline</span>
          <span className={`info-col-valore${totPipeline > 0 ? ' attenzione' : ''}`}>{totPipeline}</span>
          <FaseTracker p={p} />
        </div>
        <div>
          <span className="info-col-label">Concetti</span>
          <span className="info-col-valore">{totConcetti}</span>
        </div>
        <div>
          <span className="info-col-label">Esami</span>
          <span className="info-col-valore">{totEsami}</span>
        </div>
      </div>

      <div className="card-azioni">
        {!lead.ok && (
          <Link to={lead.href} className="btn-cta">
            Vai
          </Link>
        )}
        <Link className="chip-azione" to={`/materiali?materia=${m.slug}`}>
          Pipeline
        </Link>
        <Link className="chip-azione" to={`/active-recall?tab=ripassa&materia=${m.slug}`}>
          Studia
        </Link>
        <Link className="chip-azione" to={`/concetti?materia=${m.slug}`}>
          Concetti
        </Link>
      </div>
    </article>
  );
}

// Transformation Raise (brief): il completamento di una fase pipeline non è
// solo un numero che scende, è la fase che avanza visibilmente — un
// segmento si accende quando il relativo arretrato si azzera.
function FaseTracker({ p }: { p: PipelineMateria }) {
  const fasi = [
    p.cattura.daProcessare === 0,
    p.schematizza.daSchematizzare === 0,
    p.flashcard.concettiSenzaCarte === 0,
    p.compattazione.settimaneSenzaSintesi === 0,
    p.esami.daEstrarre === 0,
  ];
  return (
    <span className="fase-tracker" title="Cattura → Schematizza → Flashcard → Compattazione → Esami">
      {fasi.map((avanzata, i) => (
        <span key={i} className={`fase-tracker-segmento${avanzata ? ' avanzata' : ''}`} />
      ))}
    </span>
  );
}
