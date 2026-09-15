'use strict';
// Server API per la web app di ripasso (Fase 4). Riusa cli/lib/* — la
// stessa logica della CLI (Fase 3), non una riscrittura: SM-2, parsing dei
// mazzi e costruzione della sessione restano un'unica fonte di verità.
// Nessuna chiamata a Claude qui: è deterministico, vedi PIANO.md §0.

const express = require('express');
const cors = require('cors');
const path = require('path');

const vault = require('../../cli/lib/vault');
const srs = require('../../cli/lib/srs');
const { costruisciSessione, capPerMateria } = require('../../cli/lib/session');

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

    return {
      slug,
      nome: vault.readMateriaYml(slug).nome || slug,
      cattura: { daProcessare: vault.inboxDaProcessare(slug) },
      schematizza: { daSchematizzare: lezioni.filter((l) => l.stato === 'grezzo').length },
      flashcard: {
        concettiSenzaCarte: concetti.filter((c) => c.stato === 'attivo' && !concettiConCarta.has(c.id)).length,
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

// In produzione (container, §8) serve anche il build statico del frontend.
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  res.sendFile(path.join(distDir, 'index.html'), (err) => (err ? next() : undefined));
});

app.listen(PORT, () => {
  console.log(`StudyLab API in ascolto su http://localhost:${PORT}`);
});
