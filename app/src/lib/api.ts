// Client HTTP minimale verso l'API Express (app/server/index.js). Niente
// libreria esterna: fetch nativo basta per queste poche chiamate.

export interface MateriaStato {
  slug: string;
  nome: string;
  tipo_esame: string | null;
  data_esame: string | null;
  giorniAllEsame: number | null;
  attive: number;
  dovute: number;
  nuove: number;
  proposta: number;
  sospesa: number;
  capNuoveAlGiorno: number;
}

export interface StatoResponse {
  oggi: string;
  materie: MateriaStato[];
}

export interface Carta {
  srsId: string;
  materia: string;
  materiaNome: string;
  concetto: string;
  domanda: string;
  risposta: string;
}

export interface SessioneResponse {
  dovute: number;
  nuove: number;
  carte: Carta[];
}

export interface Concetto {
  materia: string;
  id: string;
  titolo: string;
  tipo: string;
  stato: string;
  confidenza: number;
  tag: string;
  numFlashcard: number;
}

// Stato di ogni fase della pipeline (cattura → schematizza → flashcard →
// cura → ripasso), non solo del ripasso: alimenta la dashboard come hub
// unico invece che come sola vista sulle flashcard (vedi CLAUDE.md).
export interface PipelineMateria {
  slug: string;
  nome: string;
  cattura: { daProcessare: number };
  schematizza: { daSchematizzare: number };
  flashcard: { concettiSenzaCarte: number };
  heatmapConfidenza: { id: string; titolo: string; confidenza: number }[];
  compattazione: { settimaneSenzaSintesi: number; prossima: string | null };
  esami: { daEstrarre: number; estratti: number; daCorreggere: number };
  cura: { daCurare: number };
  ripasso: { dovute: number; nuove: number };
}

export interface PipelineResponse {
  materie: PipelineMateria[];
}

export interface Lezione {
  materia: string;
  file: string;
  titolo: string;
  data: string | null;
  stato: string;
}

export interface Sintesi {
  materia: string;
  file: string;
  tipo: string;
  periodo: string;
  generato: string | null;
}

export interface EsameEstratto {
  materia: string;
  file: string;
  fonte: string | null;
  esercizi: number;
  dataEsame: string | null;
}

export interface EsameGenerato {
  materia: string;
  file: string;
  slug: string;
  generato: string | null;
  punteggioTotale: string | null;
}

export interface Simulazione {
  materia: string;
  file: string;
  simulazione: string | null;
  data: string | null;
  punteggio: string | null;
  punteggioTotale: string | null;
}

export interface Schema {
  materia: string;
  file: string;
  titolo: string;
  fonte: string | null;
  concetti: string;
  digitalizzato: string | null;
}

export type SezioneEliminabile =
  | 'lezioni'
  | 'concetti'
  | 'sintesi'
  | 'esami-estratti'
  | 'esami-generati'
  | 'esami-originali'
  | 'simulazioni'
  | 'schemi';

export interface NuovaMateria {
  nome: string;
  prefissoId: string;
  docente?: string;
  tipoEsame: 'orale' | 'scritto' | 'misto';
  dataEsame?: string;
  carteNuoveAlGiorno: number;
  note?: string;
}

export type SkillNome = 'cattura' | 'schematizza' | 'genera-flashcard' | 'compatta' | 'estrai-esami' | 'simula-esame' | 'correggi';

export interface Job {
  id: string;
  skill: SkillNome;
  args: Record<string, string>;
  stato: 'queue' | 'running' | 'done' | 'failed';
  creato: string;
  iniziato?: string;
  finito?: string;
  output?: string;
  errore?: string;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errore || `Errore ${res.status} su ${path}`);
  }
  return res.json();
}

export const api = {
  stato: () => req<StatoResponse>('/stato'),
  pipeline: (materia?: string) => req<PipelineResponse>(`/pipeline${materia ? `?materia=${materia}` : ''}`),
  sessione: (materia?: string) => req<SessioneResponse>(`/sessione${materia ? `?materia=${materia}` : ''}`),
  valuta: (srsId: string, materia: string, concetto: string, voto: 1 | 2 | 3 | 4) =>
    req('/valuta', { method: 'POST', body: JSON.stringify({ srsId, materia, concetto, voto }) }),
  sospendi: (srsId: string) => req('/sospendi', { method: 'POST', body: JSON.stringify({ srsId }) }),
  proposte: (materia?: string) => req<Carta[]>(`/proposte${materia ? `?materia=${materia}` : ''}`),
  cura: (srsId: string, azione: 'approva' | 'scarta') =>
    req('/cura', { method: 'POST', body: JSON.stringify({ srsId, azione }) }),
  concetti: (materia?: string) => req<Concetto[]>(`/concetti${materia ? `?materia=${materia}` : ''}`),

  creaMateria: (dati: NuovaMateria) => req<{ ok: true; slug: string }>('/materie', { method: 'POST', body: JSON.stringify(dati) }),
  eliminaMateria: (slug: string) => req<{ ok: true; slug: string }>(`/materie/${slug}`, { method: 'DELETE' }),

  esamiOriginali: (materia: string) => req<string[]>(`/esami-originali?materia=${materia}`),

  eliminaFile: (materia: string, sezione: SezioneEliminabile, file: string) =>
    req<{ ok: true; eliminati: string[] }>('/file', {
      method: 'DELETE',
      body: JSON.stringify({ materia, sezione, file }),
    }),

  lezioni: (materia?: string) => req<Lezione[]>(`/lezioni${materia ? `?materia=${materia}` : ''}`),
  sintesi: (materia?: string) => req<Sintesi[]>(`/sintesi${materia ? `?materia=${materia}` : ''}`),
  esamiEstratti: (materia?: string) => req<EsameEstratto[]>(`/esami-estratti${materia ? `?materia=${materia}` : ''}`),
  esamiGenerati: (materia?: string) => req<EsameGenerato[]>(`/esami-generati${materia ? `?materia=${materia}` : ''}`),
  simulazioni: (materia?: string) => req<Simulazione[]>(`/simulazioni${materia ? `?materia=${materia}` : ''}`),
  schemi: (materia?: string) => req<Schema[]>(`/schemi${materia ? `?materia=${materia}` : ''}`),
  salvaSchema: (materia: string, titolo: string, outline: string) =>
    req<{ ok: true; file: string; slug: string }>('/schemi', { method: 'POST', body: JSON.stringify({ materia, titolo, outline }) }),
  contenuto: (
    materia: string,
    sezione: 'lezioni' | 'concetti' | 'sintesi' | 'esami-estratti' | 'esami-generati' | 'simulazioni' | 'schemi',
    file: string
  ) =>
    req<{ frontmatter: Record<string, string>; corpo: string }>(
      `/contenuto?materia=${materia}&sezione=${sezione}&file=${encodeURIComponent(file)}`
    ),

  upload: async (materia: string, files: FileList) => {
    const form = new FormData();
    form.append('materia', materia);
    for (const f of files) form.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.errore || `Errore ${res.status} su /upload`);
    }
    return res.json() as Promise<{ ok: true; salvati: string[] }>;
  },

  jobs: () => req<Job[]>('/jobs'),
  accodaJob: (skill: SkillNome, args: Record<string, string>) =>
    req<Job>('/job', { method: 'POST', body: JSON.stringify({ skill, args }) }),
};
