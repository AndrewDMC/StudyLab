// Client HTTP minimale verso l'API Express (app/server/index.js). Niente
// libreria esterna: fetch nativo basta per queste poche chiamate.

export interface MateriaStato {
  slug: string;
  nome: string;
  tipo_esame: string | null;
  data_esame: string | null;
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
  sessione: (materia?: string) => req<SessioneResponse>(`/sessione${materia ? `?materia=${materia}` : ''}`),
  valuta: (srsId: string, materia: string, concetto: string, voto: 1 | 2 | 3 | 4) =>
    req('/valuta', { method: 'POST', body: JSON.stringify({ srsId, materia, concetto, voto }) }),
  sospendi: (srsId: string) => req('/sospendi', { method: 'POST', body: JSON.stringify({ srsId }) }),
  proposte: (materia?: string) => req<Carta[]>(`/proposte${materia ? `?materia=${materia}` : ''}`),
  cura: (srsId: string, azione: 'approva' | 'scarta') =>
    req('/cura', { method: 'POST', body: JSON.stringify({ srsId, azione }) }),
  concetti: (materia?: string) => req<Concetto[]>(`/concetti${materia ? `?materia=${materia}` : ''}`),
};
