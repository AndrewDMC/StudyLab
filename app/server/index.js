'use strict';
// Server API per la web app di ripasso (Fase 4). Riusa cli/lib/* — la
// stessa logica della CLI (Fase 3), non una riscrittura: SM-2, parsing dei
// mazzi e costruzione della sessione restano un'unica fonte di verità.
// Nessuna chiamata a Claude qui: è deterministico, vedi PIANO.md §0.

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const vault = require('../../cli/lib/vault');
const srs = require('../../cli/lib/srs');
const jobs = require('../../cli/lib/jobs');
const { isoWeek, giorniTra } = require('../../cli/lib/date');
const { costruisciSessione, capPerMateria } = require('../../cli/lib/session');

// memoryStorage, non diskStorage: con multipart, i campi di testo (qui
// "materia") possono arrivare dopo il file nel form, e i callback di
// diskStorage per destination/filename vengono invocati prima che
// req.body sia completo. Tenendo i file in memoria si scrive su disco solo
// nell'handler della route, quando materia è già validata — vedi sotto.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024, files: 10 } });

// Nota: usa API_PORT e non PORT. Un tool esterno può iniettare PORT nell'
// ambiente per il processo "principale" del dev server (qui: Vite, vedi
// vite.config.ts) — con `concurrently` quell'env var arriva anche a questo
// processo, e un nome condiviso farebbe collidere API e frontend sulla
// stessa porta. In produzione (container, PIANO.md §8) va bene impostare
// API_PORT esplicitamente nel compose.
const PORT = process.env.API_PORT || 8081;
const app = express();
app.use(cors());
app.use(express.json());

function materiaInfoPubblica(slug) {
  const info = vault.readMateriaYml(slug);
  return {
    slug,
    nome: info.nome || slug,
    tipo_esame: info.tipo_esame || null,
    data_esame: info.data_esame || null,
    // null se data_esame non è ancora compilata in materia.yml — il
    // countdown in dashboard resta nascosto finché non lo è (Fase 7).
    giorniAllEsame: info.data_esame ? giorniTra(srs.today(), info.data_esame) : null,
  };
}

// GET /api/stato — riepilogo per materia: attive, dovute, nuove, da curare, sospese.
app.get('/api/stato', (req, res) => {
  const state = srs.loadState();
  const t = srs.today();
  const tutte = vault.allCards();
  const cap = capPerMateria();

  const materie = vault.listMaterie().map((slug) => {
    const carte = tutte.filter((c) => c.materia === slug);
    const attiva = carte.filter((c) => c.stato === 'attiva');
    const dovute = attiva.filter((c) => state.carte[c.srsId] && state.carte[c.srsId].due <= t).length;
    const nuove = attiva.filter((c) => !state.carte[c.srsId]).length;
    return {
      ...materiaInfoPubblica(slug),
      attive: attiva.length,
      dovute,
      nuove,
      proposta: carte.filter((c) => c.stato === 'proposta').length,
      sospesa: carte.filter((c) => c.stato === 'sospesa').length,
      capNuoveAlGiorno: cap[slug],
    };
  });

  res.json({ oggi: t, materie });
});

// GET /api/sessione?materia=slug — la sessione di ripasso di oggi (già interleaved).
app.get('/api/sessione', (req, res) => {
  const materiaFiltro = req.query.materia || null;
  const { sessione, dovute, nuove } = costruisciSessione(srs, materiaFiltro);
  res.json({
    dovute,
    nuove,
    carte: sessione.map((c) => ({
      srsId: c.srsId,
      materia: c.materia,
      materiaNome: c.materiaNome,
      concetto: c.concetto,
      domanda: c.domanda,
      risposta: c.risposta,
    })),
  });
});

// POST /api/valuta { srsId, materia, concetto, voto: 1-4 } — applica SM-2 e salva.
app.post('/api/valuta', (req, res) => {
  const { srsId, materia, concetto, voto } = req.body || {};
  if (!srsId || !materia || !concetto || ![1, 2, 3, 4].includes(voto)) {
    return res.status(400).json({ errore: 'srsId, materia, concetto e voto (1-4) sono obbligatori' });
  }
  const state = srs.loadState();
  const esistente = state.carte[srsId] || srs.nuovaCarta(materia, concetto);
  state.carte[srsId] = srs.valuta(esistente, voto);
  srs.saveState(state);
  res.json({ carta: state.carte[srsId] });
});

// POST /api/sospendi { srsId }
app.post('/api/sospendi', (req, res) => {
  const { srsId } = req.body || {};
  if (!srsId) return res.status(400).json({ errore: 'srsId obbligatorio' });
  const ok = vault.setCardStato(srsId, 'sospesa');
  if (!ok) return res.status(404).json({ errore: 'carta non trovata' });
  res.json({ ok: true });
});

// GET /api/proposte?materia=slug — carte in attesa di curazione.
app.get('/api/proposte', (req, res) => {
  let proposte = vault.allCards({ soloStato: 'proposta' });
  if (req.query.materia) proposte = proposte.filter((c) => c.materia === req.query.materia);
  res.json(
    proposte.map((c) => ({
      srsId: c.srsId,
      materia: c.materia,
      materiaNome: c.materiaNome,
      concetto: c.concetto,
      domanda: c.domanda,
      risposta: c.risposta,
    }))
  );
});

// POST /api/cura { srsId, azione: 'approva' | 'scarta' }
app.post('/api/cura', (req, res) => {
  const { srsId, azione } = req.body || {};
  if (!srsId || !['approva', 'scarta'].includes(azione)) {
    return res.status(400).json({ errore: 'srsId e azione ("approva"|"scarta") obbligatori' });
  }
  const ok = azione === 'approva' ? vault.setCardStato(srsId, 'attiva') : vault.deleteCard(srsId);
  if (!ok) return res.status(404).json({ errore: 'carta non trovata' });
  res.json({ ok: true });
});

// GET /api/concetti?materia=slug — browser dei concetti, con copertura
// flashcard (quante carte esistono per quel concetto) per far vedere i
// "buchi" della Fase 3, non solo un dump del frontmatter.
app.get('/api/concetti', (req, res) => {
  const concetti = vault.listConcetti(req.query.materia || null);
  const tutteLeCarte = vault.allCards();
  const numCartePerConcetto = {};
  for (const c of tutteLeCarte) {
    numCartePerConcetto[c.concetto] = (numCartePerConcetto[c.concetto] || 0) + 1;
  }
  res.json(concetti.map((c) => ({ ...c, numFlashcard: numCartePerConcetto[c.id] || 0 })));
});

// GET /api/pipeline?materia=slug — stato di OGNI fase della pipeline di
// studio (non solo ripasso/cura), per la dashboard come hub unico: cosa
// c'è da fare in ciascuna fase, anche quelle guidate da skill Claude
// (cattura, schematizza) invece che da questa web app.
app.get('/api/pipeline', (req, res) => {
  const materiaFiltro = req.query.materia || null;
  const state = srs.loadState();
  const t = srs.today();
  const tutteLeCarte = vault.allCards();
  const concettiConCarta = new Set(tutteLeCarte.map((c) => c.concetto));

  const materie = (materiaFiltro ? [materiaFiltro] : vault.listMaterie()).map((slug) => {
    const carte = tutteLeCarte.filter((c) => c.materia === slug);
    const attiva = carte.filter((c) => c.stato === 'attiva');
    const lezioni = vault.listLezioni(slug);
    const concetti = vault.listConcetti(slug);
    const sintesi = vault.listSintesi(slug);
    const estratti = vault.esamiEstratti(slug);
    const generati = vault.esamiGenerati(slug);
    const correzioni = vault.simulazioni(slug);

    // Settimane con almeno una lezione schematizzata che non hanno ancora
    // una sintesi settimanale corrispondente — è il "da fare" reale della
    // Fase 5, non solo un segnaposto.
    const settimaneConLezioni = new Set(
      lezioni.filter((l) => l.data && l.stato === 'schematizzato').map((l) => isoWeek(l.data))
    );
    const settimaneConSintesi = new Set(sintesi.filter((s) => s.tipo === 'settimanale').map((s) => s.periodo));
    const elencoSettimaneScoperte = [...settimaneConLezioni].filter((w) => !settimaneConSintesi.has(w)).sort();

    // Esami (Fase 6): originali senza estratto corrispondente, e consegne
    // generate senza correzione — i campi `fonte`/`simulazione` degli
    // estratti/correzioni sono relativi alla RADICE DELLA MATERIA (stesso
    // formato di `fonte` nelle lezioni, vedi CLAUDE.md), non alla radice
    // del vault: il confronto va fatto con lo stesso formato su entrambi
    // i lati, altrimenti non riconosce mai un estratto/correzione come
    // già coperto (bug reale trovato testando /estrai-esami sul vault).
    const daEstrarre = vault.esamiDaEstrarre(slug).length;
    const consegneCorrette = new Set(correzioni.map((c) => c.simulazione));
    const daCorreggere = generati.filter((g) => !consegneCorrette.has(`05-esami/generati/${g.file}`)).length;

    return {
      slug,
      nome: vault.readMateriaYml(slug).nome || slug,
      cattura: { daProcessare: vault.inboxDaProcessare(slug) },
      schematizza: { daSchematizzare: lezioni.filter((l) => l.stato === 'grezzo').length },
      flashcard: {
        concettiSenzaCarte: concetti.filter((c) => c.stato === 'attivo' && !concettiConCarta.has(c.id)).length,
      },
      // Heatmap confidenza (Fase 7): solo concetti `attivo` — una `bozza`
      // non è ancora stata testata per definizione, non ha senso mostrarla
      // come "punto debole". confidenza resta a 0 finché /correggi non
      // l'ha misurata almeno una volta (vedi CLAUDE.md).
      heatmapConfidenza: concetti
        .filter((c) => c.stato === 'attivo')
        .map((c) => ({ id: c.id, titolo: c.titolo, confidenza: c.confidenza })),
      // `prossima` è la settimana scoperta più vecchia: il pulsante
      // "Compatta" in Materiali la passa esplicitamente come periodo,
      // altrimenti senza argomento la skill compatterebbe la settimana
      // *corrente* — sbagliata se il materiale scoperto è di settimane
      // passate (vedi test con lezione datata 2024).
      compattazione: { settimaneSenzaSintesi: elencoSettimaneScoperte.length, prossima: elencoSettimaneScoperte[0] || null },
      esami: {
        daEstrarre,
        estratti: estratti.reduce((s, e) => s + (e.esercizi || 0), 0),
        daCorreggere,
      },
      cura: { daCurare: carte.filter((c) => c.stato === 'proposta').length },
      ripasso: {
        dovute: attiva.filter((c) => state.carte[c.srsId] && state.carte[c.srsId].due <= t).length,
        nuove: attiva.filter((c) => !state.carte[c.srsId]).length,
      },
    };
  });

  res.json({ materie });
});

// POST /api/materie { nome, prefissoId, docente, tipoEsame, dataEsame, carteNuoveAlGiorno, note }
// Crea una nuova materia da zero (cartelle + materia.yml) — la "creazione
// diretta dall'interfaccia" richiesta dall'utente, non solo materie già
// presenti nel vault come finora.
app.post('/api/materie', (req, res) => {
  const { nome, prefissoId, docente, tipoEsame, dataEsame, carteNuoveAlGiorno, note } = req.body || {};
  try {
    const r = vault.creaMateria({ nome, prefissoId, docente, tipoEsame, dataEsame, carteNuoveAlGiorno, note });
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(400).json({ errore: e.message });
  }
});

// GET /api/esami-originali?materia=slug — PDF/scan in 05-esami/originali/
// (percorso relativo alla radice della materia, sottocartelle libere —
// vedi vault.esamiOriginali). Serve al viewer "Materiali" per elencarli ed
// eliminarli dalla stessa interfaccia, non solo agli estratti già letti.
app.get('/api/esami-originali', (req, res) => {
  try {
    res.json(vault.esamiOriginali(req.query.materia));
  } catch (e) {
    res.status(400).json({ errore: e.message });
  }
});

// DELETE /api/file { materia, sezione, file } — elimina un elemento di una
// sezione del vault (lezione, concetto, sintesi, esame, simulazione,
// schema...). Stessa validazione a whitelist di /api/contenuto: vedi
// vault.eliminaFile.
app.delete('/api/file', (req, res) => {
  const { materia, sezione, file } = req.body || {};
  try {
    const r = vault.eliminaFile(materia, sezione, file);
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(400).json({ errore: e.message });
  }
});

// GET /api/lezioni?materia=slug — elenco lezioni (per il viewer "Materiali").
app.get('/api/lezioni', (req, res) => {
  res.json(vault.listLezioni(req.query.materia || null));
});

// GET /api/sintesi?materia=slug — elenco sintesi settimanali/mensili (Fase 5).
app.get('/api/sintesi', (req, res) => {
  res.json(vault.listSintesi(req.query.materia || null));
});

// GET /api/esami-estratti?materia=slug — estratti da /estrai-esami (Fase 6).
app.get('/api/esami-estratti', (req, res) => {
  res.json(vault.esamiEstratti(req.query.materia || null));
});

// GET /api/esami-generati?materia=slug — consegne generate da /simula-esame.
app.get('/api/esami-generati', (req, res) => {
  res.json(vault.esamiGenerati(req.query.materia || null));
});

// GET /api/simulazioni?materia=slug — correzioni scritte da /correggi.
app.get('/api/simulazioni', (req, res) => {
  res.json(vault.simulazioni(req.query.materia || null));
});

// GET /api/schemi?materia=slug — schemi in 07-schemi/ (Fase 9): sia quelli
// digitalizzati da foto (/digitalizza-schema) sia quelli scritti a mano
// libera nell'editor outline qui sotto.
app.get('/api/schemi', (req, res) => {
  res.json(vault.listSchemi(req.query.materia || null));
});

// POST /api/schemi { materia, titolo, outline } — salva un outline scritto
// direttamente nell'editor della dashboard (Fase 9 §A: "un <textarea> e
// una libreria", mai una chiamata a Claude — è testo scritto dall'utente,
// non generato, vedi CLAUDE.md).
app.post('/api/schemi', (req, res) => {
  const { materia, titolo, outline } = req.body || {};
  try {
    const r = vault.salvaSchemaOutline(materia, { titolo, outline, oggi: srs.today() });
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(400).json({ errore: e.message });
  }
});

// GET /api/contenuto?materia=slug&sezione=lezioni|concetti|sintesi&file=nome.md
// Lettura sicura di un file del vault (vedi validazione in vault.leggiContenuto:
// il nome file deve combaciare con una voce reale della cartella, non è mai
// costruito fidandosi della query string).
app.get('/api/contenuto', (req, res) => {
  const { materia, sezione, file } = req.query;
  try {
    const raw = vault.leggiContenuto(materia, sezione, file);
    // Il frontmatter va separato PRIMA di mandare il corpo a un parser
    // Markdown lato client: altrimenti il "---" viene letto come hr/setext
    // heading e corrompe il rendering (bug reale trovato testando).
    const { fm, corpo } = vault.separaFrontmatter(raw);
    res.json({ frontmatter: fm, corpo });
  } catch (e) {
    res.status(404).json({ errore: e.message });
  }
});

// POST /api/upload — multipart/form-data: materia + uno o più file, salvati
// in materie/<materia>/00-inbox/. È la "sezione di inserimento": da qui il
// materiale entra nel vault, pronto per /cattura (via job, sotto).
app.post('/api/upload', upload.array('file', 10), (req, res) => {
  const { materia } = req.body || {};
  let dir;
  try {
    dir = vault.inboxDir(materia);
  } catch (e) {
    return res.status(400).json({ errore: e.message });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ errore: 'nessun file ricevuto' });
  }

  const salvati = [];
  for (const f of req.files) {
    // Nome sicuro: solo il basename (niente componenti di percorso da un
    // nome file client-controllato), caratteri ristretti, prefisso
    // temporale per evitare collisioni tra upload distinti.
    const base = path
      .basename(f.originalname)
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}._-]+/gu, '-')
      .slice(0, 120);
    const nome = `${Date.now()}-${base || 'file'}`;
    fs.writeFileSync(path.join(dir, nome), f.buffer);
    salvati.push(nome);
  }
  res.json({ ok: true, salvati });
});

// GET /api/jobs — coda job (tutti gli stati, più recenti prima).
app.get('/api/jobs', (req, res) => {
  res.json(jobs.listJobs());
});

// POST /api/job { skill, args } — accoda un job per il worker (cli/worker.js).
// Questo endpoint NON invoca Claude: scrive solo un file in _jobs/queue/.
// Chi esegue davvero il job è un processo separato che l'utente avvia a
// parte (vedi CLAUDE.md) — vedi PIANO.md §0 sul perché questa separazione
// è la regola d'oro dell'intero sistema.
app.post('/api/job', (req, res) => {
  const { skill, args } = req.body || {};
  try {
    const job = jobs.enqueue(skill, args);
    res.json(job);
  } catch (e) {
    res.status(400).json({ errore: e.message });
  }
});

// In produzione (container, §8) serve anche il build statico del frontend.
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  res.sendFile(path.join(distDir, 'index.html'), (err) => (err ? next() : undefined));
});

app.listen(PORT, () => {
  console.log(`StudyLab API in ascolto su http://localhost:${PORT}`);
});
