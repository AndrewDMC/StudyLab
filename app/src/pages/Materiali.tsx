import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, Job, Lezione, MateriaStato, PipelineMateria, SkillNome, Sintesi } from '../lib/api';
import { Markdown } from '../components/Markdown';

// "Sezione di inserimento" + "sezione di visualizzazione" richieste
// dall'utente: qui il materiale entra nel vault (upload in 00-inbox) e si
// vede quello che c'è già (lezioni renderizzate in Markdown), con i
// pulsanti per far girare le skill che li trasformano — non solo una vista
// esterna sullo stato, ma il punto da cui si aziona la pipeline.
export function Materiali() {
  const [params, setParams] = useSearchParams();
  const [materie, setMaterie] = useState<MateriaStato[] | null>(null);
  const materiaSel = params.get('materia') || '';

  useEffect(() => {
    api.stato().then((r) => {
      setMaterie(r.materie);
      if (!materiaSel && r.materie[0]) {
        const next = new URLSearchParams(params);
        next.set('materia', r.materie[0].slug);
        setParams(next, { replace: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setMateria(slug: string) {
    const next = new URLSearchParams(params);
    next.set('materia', slug);
    setParams(next, { replace: true });
  }

  if (!materie) return <p>Caricamento…</p>;

  return (
    <div className="pagina">
      <h1>Materiali</h1>
      <div className="barra-controlli">
        <select className="select-materia" value={materiaSel} onChange={(e) => setMateria(e.target.value)}>
          {materie.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      {materiaSel && <ContenutoMateria materia={materiaSel} />}
    </div>
  );
}

type Apribile = { sezione: 'lezioni' | 'sintesi'; file: string; titolo: string };

function ContenutoMateria({ materia }: { materia: string }) {
  const [pipeline, setPipeline] = useState<PipelineMateria | null>(null);
  const [lezioni, setLezioni] = useState<Lezione[] | null>(null);
  const [sintesi, setSintesi] = useState<Sintesi[] | null>(null);
  const [aperta, setAperta] = useState<Apribile | null>(null);
  const [contenuto, setContenuto] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState<string | null>(null);

  const ricarica = useCallback(() => {
    api.pipeline(materia).then((r) => setPipeline(r.materie[0] || null));
    api.lezioni(materia).then(setLezioni);
    api.sintesi(materia).then(setSintesi);
  }, [materia]);

  useEffect(() => {
    setAperta(null);
    setContenuto(null);
    ricarica();
  }, [materia, ricarica]);

  function apri(voce: Apribile) {
    setAperta(voce);
    setContenuto(null);
    api
      .contenuto(materia, voce.sezione, voce.file)
      .then((r) => setContenuto(r.corpo))
      .catch((e) => setErrore(e.message));
  }

  async function accoda(skill: SkillNome, args: Record<string, string>, chiave: string) {
    setInCorso(chiave);
    try {
      await api.accodaJob(skill, args);
      ricarica();
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setInCorso(null);
    }
  }

  return (
    <>
      {errore && <p className="errore">Errore: {errore}</p>}

      <Caricamento materia={materia} onCaricato={ricarica} />

      {pipeline && <AzioniPipeline materia={materia} pipeline={pipeline} accoda={accoda} inCorso={inCorso} />}

      <section className="gruppo-materia">
        <h2 className="gruppo-titolo">Lezioni</h2>
        {!lezioni ? (
          <p>Caricamento…</p>
        ) : lezioni.length === 0 ? (
          <p className="sottotitolo">Nessuna lezione ancora. Carica materiale e lancia /cattura.</p>
        ) : (
          <div className="lista-lezioni">
            {lezioni.map((l) => (
              <div key={l.file} className={aperta?.file === l.file ? 'riga-lezione attiva' : 'riga-lezione'}>
                <button
                  className="riga-lezione-corpo"
                  onClick={() => apri({ sezione: 'lezioni', file: l.file, titolo: l.titolo })}
                >
                  <span className="riga-lezione-titolo">{l.titolo}</span>
                  <span className="riga-lezione-meta">
                    {l.data} · <span className={`badge-stato stato-${l.stato}`}>{l.stato}</span>
                  </span>
                </button>
                {l.stato === 'grezzo' && l.data && (
                  <button
                    className="chip-azione"
                    disabled={inCorso === `schematizza-${l.file}`}
                    onClick={() => accoda('schematizza', { materia, data: l.data! }, `schematizza-${l.file}`)}
                  >
                    {inCorso === `schematizza-${l.file}` ? 'Accodo…' : 'Schematizza'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="gruppo-materia">
        <h2 className="gruppo-titolo">Sintesi</h2>
        {!sintesi ? (
          <p>Caricamento…</p>
        ) : sintesi.length === 0 ? (
          <p className="sottotitolo">Nessuna sintesi ancora. Compattala dalle Azioni qui sopra.</p>
        ) : (
          <div className="lista-lezioni">
            {sintesi.map((s) => (
              <div key={s.file} className={aperta?.file === s.file ? 'riga-lezione attiva' : 'riga-lezione'}>
                <button
                  className="riga-lezione-corpo"
                  onClick={() => apri({ sezione: 'sintesi', file: s.file, titolo: `${s.tipo} · ${s.periodo}` })}
                >
                  <span className="riga-lezione-titolo">{s.periodo}</span>
                  <span className="riga-lezione-meta">
                    <span className="badge-stato">{s.tipo}</span> · generata {s.generato || '?'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {aperta && (
        <section className="visore">
          <div className="visore-intestazione">
            <h2>{aperta.titolo}</h2>
            <button className="link-minore" onClick={() => setAperta(null)}>
              Chiudi
            </button>
          </div>
          {contenuto === null ? <p>Caricamento…</p> : <Markdown text={contenuto} />}
        </section>
      )}

      <JobQueue />
    </>
  );
}

function Caricamento({ materia, onCaricato }: { materia: string; onCaricato: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stato, setStato] = useState<'idle' | 'caricando' | 'ok' | 'errore'>('idle');
  const [messaggio, setMessaggio] = useState('');

  async function carica() {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) return;
    setStato('caricando');
    try {
      const r = await api.upload(materia, files);
      setStato('ok');
      setMessaggio(`${r.salvati.length} file caricati in 00-inbox/`);
      if (inputRef.current) inputRef.current.value = '';
      onCaricato();
    } catch (e) {
      setStato('errore');
      setMessaggio((e as Error).message);
    }
  }

  return (
    <section className="riquadro-carica">
      <h2 className="gruppo-titolo">Carica materiale</h2>
      <p className="sottotitolo">Foto di appunti, PDF, slide — finiscono in 00-inbox/, pronti per /cattura.</p>
      <div className="carica-controlli">
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf,.pptx,.ppt,.md,.txt" />
        <button className="bottone-secondario" onClick={carica} disabled={stato === 'caricando'}>
          {stato === 'caricando' ? 'Carico…' : 'Carica'}
        </button>
      </div>
      {messaggio && <p className={stato === 'errore' ? 'errore' : 'nota-successo'}>{messaggio}</p>}
    </section>
  );
}

// Pulsanti che accodano davvero un job per il worker (cli/worker.js): non
// eseguono Claude da qui (il server non lo fa mai, vedi CLAUDE.md), solo
// scrivono in _jobs/queue/. Il worker — avviato a parte dall'utente — è
// quello che consuma la coda.
function AzioniPipeline({
  materia,
  pipeline,
  accoda,
  inCorso,
}: {
  materia: string;
  pipeline: PipelineMateria;
  accoda: (skill: SkillNome, args: Record<string, string>, chiave: string) => void;
  inCorso: string | null;
}) {
  return (
    <section className="riquadro-azioni">
      <h2 className="gruppo-titolo">Azioni</h2>
      <div className="azioni-pipeline">
        <button
          className="chip-azione"
          disabled={pipeline.cattura.daProcessare === 0 || inCorso === 'cattura'}
          onClick={() => accoda('cattura', { materia }, 'cattura')}
        >
          {inCorso === 'cattura' ? 'Accodo…' : `Cattura (${pipeline.cattura.daProcessare} in attesa)`}
        </button>
        <button
          className="chip-azione"
          disabled={pipeline.flashcard.concettiSenzaCarte === 0 || inCorso === 'flashcard'}
          onClick={() => accoda('genera-flashcard', { materia }, 'flashcard')}
        >
          {inCorso === 'flashcard' ? 'Accodo…' : `Genera flashcard (${pipeline.flashcard.concettiSenzaCarte} concetti scoperti)`}
        </button>
        <button
          className="chip-azione"
          disabled={!pipeline.compattazione.prossima || inCorso === 'compatta'}
          onClick={() =>
            pipeline.compattazione.prossima &&
            accoda('compatta', { materia, tipo: 'settimana', periodo: pipeline.compattazione.prossima }, 'compatta')
          }
          title={pipeline.compattazione.prossima ? `Compatta ${pipeline.compattazione.prossima}` : undefined}
        >
          {inCorso === 'compatta'
            ? 'Accodo…'
            : `Compatta (${pipeline.compattazione.settimaneSenzaSintesi} settimane senza sintesi)`}
        </button>
      </div>
      <p className="nota">
        Ogni azione accoda un job per <code>cli/worker.js</code> — va avviato a parte
        (<code>node cli/worker.js</code>) perché è lui a invocare davvero Claude Code, mai il server della web app.
      </p>
    </section>
  );
}

function JobQueue() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [aperto, setAperto] = useState<string | null>(null);

  useEffect(() => {
    let attivo = true;
    async function tick() {
      try {
        const r = await api.jobs();
        if (attivo) setJobs(r);
      } catch {
        // silenzioso: il polling riprova al giro successivo
      }
    }
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      attivo = false;
      clearInterval(id);
    };
  }, []);

  if (jobs.length === 0) return null;

  return (
    <section className="gruppo-materia">
      <h2 className="gruppo-titolo">Coda job</h2>
      <div className="lista-job">
        {jobs.slice(0, 10).map((j) => (
          <div key={j.id} className="riga-job">
            <button className="riga-job-intestazione" onClick={() => setAperto(aperto === j.id ? null : j.id)}>
              <span className={`badge-stato stato-${j.stato}`}>{j.stato}</span>
              <span className="riga-job-skill">/{j.skill}</span>
              <span className="riga-job-args">{Object.values(j.args).join(' ')}</span>
            </button>
            {aperto === j.id && (j.output || j.errore) && (
              <pre className="riga-job-output">{j.errore ? `Errore: ${j.errore}\n\n` : ''}{j.output}</pre>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
