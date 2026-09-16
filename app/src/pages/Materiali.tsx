import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  api,
  EsameEstratto,
  EsameGenerato,
  Job,
  Lezione,
  MateriaStato,
  PipelineMateria,
  Schema,
  SkillNome,
  Simulazione,
  Sintesi,
} from '../lib/api';
import { Markdown } from '../components/Markdown';
import { MarkmapPreview } from '../components/MarkmapPreview';

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
      <h1>Pipeline</h1>
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

type Apribile = { sezione: 'lezioni' | 'sintesi' | 'esami-estratti' | 'esami-generati' | 'simulazioni' | 'schemi'; file: string; titolo: string };

function ContenutoMateria({ materia }: { materia: string }) {
  const [pipeline, setPipeline] = useState<PipelineMateria | null>(null);
  const [lezioni, setLezioni] = useState<Lezione[] | null>(null);
  const [sintesi, setSintesi] = useState<Sintesi[] | null>(null);
  const [estratti, setEstratti] = useState<EsameEstratto[] | null>(null);
  const [generati, setGenerati] = useState<EsameGenerato[] | null>(null);
  const [simulazioni, setSimulazioni] = useState<Simulazione[] | null>(null);
  const [schemi, setSchemi] = useState<Schema[] | null>(null);
  const [aperta, setAperta] = useState<Apribile | null>(null);
  const [contenuto, setContenuto] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState<string | null>(null);

  const ricarica = useCallback(() => {
    api.pipeline(materia).then((r) => setPipeline(r.materie[0] || null));
    api.lezioni(materia).then(setLezioni);
    api.sintesi(materia).then(setSintesi);
    api.esamiEstratti(materia).then(setEstratti);
    api.esamiGenerati(materia).then(setGenerati);
    api.simulazioni(materia).then(setSimulazioni);
    api.schemi(materia).then(setSchemi);
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

      <section className="gruppo-materia">
        <h2 className="gruppo-titolo">Esami</h2>
        {!estratti || !generati || !simulazioni ? (
          <p>Caricamento…</p>
        ) : estratti.length === 0 && generati.length === 0 ? (
          <p className="sottotitolo">
            Nessun esame estratto ancora. Lancia "Estrai esami" dalle Azioni qui sopra per leggere i temi in
            05-esami/originali/.
          </p>
        ) : (
          <div className="lista-lezioni">
            {estratti.map((e) => (
              <div key={e.file} className={aperta?.file === e.file ? 'riga-lezione attiva' : 'riga-lezione'}>
                <button
                  className="riga-lezione-corpo"
                  onClick={() => apri({ sezione: 'esami-estratti', file: e.file, titolo: e.file })}
                >
                  <span className="riga-lezione-titolo">{e.dataEsame || e.file}</span>
                  <span className="riga-lezione-meta">
                    <span className="badge-stato">estratto</span> · {e.esercizi} esercizi · {e.file}
                  </span>
                </button>
              </div>
            ))}
            {generati.map((g) => {
              // `simulazione` nel frontmatter delle correzioni è relativo alla
              // radice della materia (come `fonte` nelle lezioni, vedi
              // CLAUDE.md), non alla radice del vault — niente prefisso
              // "materie/<slug>/" qui (bug reale corretto dopo test su vault).
              const corretta = simulazioni.some((s) => s.simulazione === `05-esami/generati/${g.file}`);
              return (
                <div key={g.file} className={aperta?.file === g.file ? 'riga-lezione attiva' : 'riga-lezione'}>
                  <button
                    className="riga-lezione-corpo"
                    onClick={() => apri({ sezione: 'esami-generati', file: g.file, titolo: g.slug })}
                  >
                    <span className="riga-lezione-titolo">{g.slug}</span>
                    <span className="riga-lezione-meta">
                      <span className="badge-stato">variante</span> · generata {g.generato || '?'}
                    </span>
                  </button>
                  {!corretta && (
                    <button
                      className="chip-azione"
                      disabled={inCorso === `correggi-${g.slug}`}
                      title="Richiede di aver già risposto nell'area di risposta della consegna"
                      onClick={() => accoda('correggi', { materia, slug: g.slug }, `correggi-${g.slug}`)}
                    >
                      {inCorso === `correggi-${g.slug}` ? 'Accodo…' : 'Correggi'}
                    </button>
                  )}
                </div>
              );
            })}
            {simulazioni.map((s) => (
              <div key={s.file} className={aperta?.file === s.file ? 'riga-lezione attiva' : 'riga-lezione'}>
                <button
                  className="riga-lezione-corpo"
                  onClick={() => apri({ sezione: 'simulazioni', file: s.file, titolo: `Correzione ${s.data || ''}` })}
                >
                  <span className="riga-lezione-titolo">{s.data}</span>
                  <span className="riga-lezione-meta">
                    <span className="badge-stato">corretta</span> · {s.punteggio ?? '?'}/{s.punteggioTotale ?? '?'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="gruppo-materia">
        <h2 className="gruppo-titolo">Schemi</h2>
        {!schemi ? (
          <p>Caricamento…</p>
        ) : schemi.length === 0 ? (
          <p className="sottotitolo">
            Nessuno schema ancora. Scrivine uno qui sotto, oppure fotografalo e lancia /digitalizza-schema.
          </p>
        ) : (
          <div className="lista-lezioni">
            {schemi.map((s) => (
              <div key={s.file} className={aperta?.file === s.file ? 'riga-lezione attiva' : 'riga-lezione'}>
                <button
                  className="riga-lezione-corpo"
                  onClick={() => apri({ sezione: 'schemi', file: s.file, titolo: s.titolo })}
                >
                  <span className="riga-lezione-titolo">{s.titolo}</span>
                  <span className="riga-lezione-meta">
                    <span className="badge-stato">{s.fonte === 'digitazione diretta' ? 'scritto' : 'digitalizzato'}</span> ·{' '}
                    {s.digitalizzato || '?'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
        <EditorSchema materia={materia} onSalvato={ricarica} />
      </section>

      {aperta && (
        <section className="visore">
          <div className="visore-intestazione">
            <h2>{aperta.titolo}</h2>
            <button className="link-minore" onClick={() => setAperta(null)}>
              Chiudi
            </button>
          </div>
          {contenuto === null ? (
            <p>Caricamento…</p>
          ) : aperta.sezione === 'schemi' ? (
            <MarkmapPreview outline={contenuto} />
          ) : (
            <Markdown text={contenuto} />
          )}
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
          className={`chip-azione${pipeline.cattura.daProcessare === 0 ? ' completata' : ''}`}
          disabled={pipeline.cattura.daProcessare === 0 || inCorso === 'cattura'}
          onClick={() => accoda('cattura', { materia }, 'cattura')}
        >
          {inCorso === 'cattura'
            ? 'Accodo…'
            : pipeline.cattura.daProcessare === 0
            ? 'Cattura — completata'
            : `Cattura (${pipeline.cattura.daProcessare} in attesa)`}
        </button>
        <button
          className={`chip-azione${pipeline.flashcard.concettiSenzaCarte === 0 ? ' completata' : ''}`}
          disabled={pipeline.flashcard.concettiSenzaCarte === 0 || inCorso === 'flashcard'}
          onClick={() => accoda('genera-flashcard', { materia }, 'flashcard')}
        >
          {inCorso === 'flashcard'
            ? 'Accodo…'
            : pipeline.flashcard.concettiSenzaCarte === 0
            ? 'Flashcard — completata'
            : `Genera flashcard (${pipeline.flashcard.concettiSenzaCarte} concetti scoperti)`}
        </button>
        <button
          className={`chip-azione${!pipeline.compattazione.prossima ? ' completata' : ''}`}
          disabled={!pipeline.compattazione.prossima || inCorso === 'compatta'}
          onClick={() =>
            pipeline.compattazione.prossima &&
            accoda('compatta', { materia, tipo: 'settimana', periodo: pipeline.compattazione.prossima }, 'compatta')
          }
          title={pipeline.compattazione.prossima ? `Compatta ${pipeline.compattazione.prossima}` : undefined}
        >
          {inCorso === 'compatta'
            ? 'Accodo…'
            : !pipeline.compattazione.prossima
            ? 'Compattazione — completata'
            : `Compatta (${pipeline.compattazione.settimaneSenzaSintesi} settimane senza sintesi)`}
        </button>
        <button
          className={`chip-azione${pipeline.esami.daEstrarre === 0 ? ' completata' : ''}`}
          disabled={pipeline.esami.daEstrarre === 0 || inCorso === 'estrai-esami'}
          onClick={() => accoda('estrai-esami', { materia }, 'estrai-esami')}
        >
          {inCorso === 'estrai-esami'
            ? 'Accodo…'
            : pipeline.esami.daEstrarre === 0
            ? 'Estrazione — completata'
            : `Estrai esami (${pipeline.esami.daEstrarre} PDF non estratti)`}
        </button>
        <button
          className="chip-azione"
          disabled={pipeline.esami.estratti === 0 || inCorso === 'simula-esame'}
          title={pipeline.esami.estratti === 0 ? 'Serve prima almeno un esame estratto' : undefined}
          onClick={() => accoda('simula-esame', { materia }, 'simula-esame')}
        >
          {inCorso === 'simula-esame' ? 'Accodo…' : 'Genera simulazione'}
        </button>
      </div>
      <p className="nota">
        Ogni azione accoda un job per <code>cli/worker.js</code> — va avviato a parte
        (<code>node cli/worker.js</code>) perché è lui a invocare davvero Claude Code, mai il server della web app.
      </p>
    </section>
  );
}

// Editor outline+markmap (Fase 9 §A): un <textarea> e una libreria,
// niente formato nuovo. Nessuna chiamata a Claude — è testo che l'utente
// scrive lui stesso, salvato subito in 07-schemi/ (vedi CLAUDE.md e
// PIANO.md §9: "digitare è più veloce che disegnare" per il 70% dei casi).
function EditorSchema({ materia, onSalvato }: { materia: string; onSalvato: () => void }) {
  const [aperto, setAperto] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [outline, setOutline] = useState('- ');
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  async function salva() {
    setErrore(null);
    setSalvando(true);
    try {
      await api.salvaSchema(materia, titolo, outline);
      setTitolo('');
      setOutline('- ');
      setAperto(false);
      onSalvato();
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (!aperto) {
    return (
      <button className="bottone-secondario" onClick={() => setAperto(true)}>
        + Nuovo schema
      </button>
    );
  }

  return (
    <div className="editor-schema">
      <input
        className="ricerca"
        placeholder="Titolo dello schema"
        value={titolo}
        onChange={(e) => setTitolo(e.target.value)}
      />
      <div className="editor-schema-corpo">
        <textarea
          className="editor-schema-testo"
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          placeholder={'- Argomento\n  - Sotto-argomento (C-ARCH-0042)\n    - Dettaglio'}
          spellCheck={false}
        />
        <MarkmapPreview outline={outline} />
      </div>
      {errore && <p className="errore">Errore: {errore}</p>}
      <div className="carica-controlli">
        <button className="bottone-secondario" onClick={() => setAperto(false)} disabled={salvando}>
          Annulla
        </button>
        <button className="chip-azione evidenzia" onClick={salva} disabled={salvando || !titolo.trim() || !outline.trim()}>
          {salvando ? 'Salvo…' : 'Salva schema'}
        </button>
      </div>
    </div>
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
