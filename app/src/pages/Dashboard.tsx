import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, MateriaStato, NuovaMateria, PipelineMateria } from '../lib/api';

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

  const ricarica = () => {
    Promise.all([api.stato(), api.pipeline()])
      .then(([s, p]) => {
        setStato(s);
        setPipeline(p.materie);
      })
      .catch((e) => setErrore(e.message));
  };

  useEffect(ricarica, []);

  if (errore) return <p className="errore">Errore: {errore}</p>;
  if (!stato || !pipeline) return <p className="caricamento">Caricamento…</p>;

  if (stato.materie.length === 0) {
    return (
      <div className="dashboard-vuoto">
        <p>Nessuna materia ancora.</p>
        <NuovaMateriaForm onCreata={ricarica} />
      </div>
    );
  }

  return (
    <>
      <div className="stack-materie">
        {stato.materie.map((m) => {
          const p = pipeline.find((x) => x.slug === m.slug);
          return p ? <CardMateria key={m.slug} m={m} p={p} /> : null;
        })}
      </div>
      <NuovaMateriaForm onCreata={ricarica} />
    </>
  );
}

// Creazione materia "direttamente dall'interfaccia" (richiesta utente): la
// panoramica non è più solo una vista sulle materie già presenti nel vault,
// è anche il punto da cui nascono. Stesso pattern a due stati (bottone →
// form inline) usato dall'editor schema in Materiali.tsx.
function NuovaMateriaForm({ onCreata }: { onCreata: () => void }) {
  const [aperto, setAperto] = useState(false);
  const [nome, setNome] = useState('');
  const [prefissoId, setPrefissoId] = useState('');
  const [prefissoToccato, setPrefissoToccato] = useState(false);
  const [docente, setDocente] = useState('');
  const [tipoEsame, setTipoEsame] = useState<NuovaMateria['tipoEsame']>('scritto');
  const [dataEsame, setDataEsame] = useState('');
  const [carteNuoveAlGiorno, setCarteNuoveAlGiorno] = useState('15');
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  function suggerisciPrefisso(v: string) {
    if (prefissoToccato) return;
    const lettere = v.replace(/[^a-zA-Z]/g, '').toUpperCase();
    setPrefissoId(lettere.slice(0, 4));
  }

  function reset() {
    setNome('');
    setPrefissoId('');
    setPrefissoToccato(false);
    setDocente('');
    setTipoEsame('scritto');
    setDataEsame('');
    setCarteNuoveAlGiorno('15');
    setErrore(null);
  }

  async function salva() {
    setErrore(null);
    setSalvando(true);
    try {
      await api.creaMateria({
        nome: nome.trim(),
        prefissoId: prefissoId.trim(),
        docente: docente.trim() || undefined,
        tipoEsame,
        dataEsame: dataEsame || undefined,
        carteNuoveAlGiorno: parseInt(carteNuoveAlGiorno, 10),
      });
      reset();
      setAperto(false);
      onCreata();
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (!aperto) {
    return (
      <button className="bottone-secondario bottone-nuova-materia" onClick={() => setAperto(true)}>
        + Nuova materia
      </button>
    );
  }

  const valido = nome.trim().length > 0 && /^[A-Z]{2,8}$/.test(prefissoId.trim()) && parseInt(carteNuoveAlGiorno, 10) > 0;

  return (
    <div className="editor-schema form-nuova-materia">
      <div className="griglia-form">
        <label>
          Nome materia
          <input
            className="ricerca"
            placeholder="Analisi Matematica II"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              suggerisciPrefisso(e.target.value);
            }}
          />
        </label>
        <label>
          Prefisso ID concetti
          <input
            className="ricerca"
            placeholder="MAT"
            value={prefissoId}
            onChange={(e) => {
              setPrefissoToccato(true);
              setPrefissoId(e.target.value.toUpperCase());
            }}
          />
        </label>
        <label>
          Docente (opzionale)
          <input className="ricerca" value={docente} onChange={(e) => setDocente(e.target.value)} />
        </label>
        <label>
          Tipo esame
          <select className="select-materia" value={tipoEsame} onChange={(e) => setTipoEsame(e.target.value as NuovaMateria['tipoEsame'])}>
            <option value="scritto">scritto</option>
            <option value="orale">orale</option>
            <option value="misto">misto</option>
          </select>
        </label>
        <label>
          Data esame (opzionale)
          <input className="ricerca" type="date" value={dataEsame} onChange={(e) => setDataEsame(e.target.value)} />
        </label>
        <label>
          Carte nuove al giorno
          <input
            className="ricerca"
            type="number"
            min={1}
            max={200}
            value={carteNuoveAlGiorno}
            onChange={(e) => setCarteNuoveAlGiorno(e.target.value)}
          />
        </label>
      </div>
      {errore && <p className="errore">Errore: {errore}</p>}
      <div className="carica-controlli">
        <button
          className="bottone-secondario"
          onClick={() => {
            reset();
            setAperto(false);
          }}
          disabled={salvando}
        >
          Annulla
        </button>
        <button className="chip-azione evidenzia" onClick={salva} disabled={salvando || !valido}>
          {salvando ? 'Creo…' : 'Crea materia'}
        </button>
      </div>
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
