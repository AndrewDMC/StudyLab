'use strict';
// Utility per le settimane ISO 8601 (lunedì-domenica), usate dalla skill
// /compatta e dal calcolo "settimane senza sintesi" in dashboard. Stessa
// cautela sui fusi orari di cli/lib/srs.js: si lavora sempre con
// componenti di data espliciti, mai con conversioni implicite.

function pad2(n) {
  return String(n).padStart(2, '0');
}

// AAAA-MM-GG → AAAA-Www (algoritmo standard ISO 8601: la settimana 1 è
// quella che contiene il primo giovedì dell'anno).
function isoWeek(dataStr) {
  const [y, m, d] = dataStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const giorno = (date.getUTCDay() + 6) % 7; // lunedì=0 ... domenica=6
  date.setUTCDate(date.getUTCDate() - giorno + 3); // giovedì della stessa settimana
  const primoGennaio = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const settimana = Math.ceil(((date - primoGennaio) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${pad2(settimana)}`;
}

function settimanaCorrente() {
  const d = new Date();
  return isoWeek(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
}

function meseCorrente() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

// Giorni interi da dataDa a dataA (negativo se dataA è nel passato).
// Componenti di data locali su entrambi i lati, mai un giro per UTC/
// toISOString — stessa cautela sui fusi orari di cli/lib/srs.js (vedi
// PIANO.md §3): usata per il countdown esame in dashboard.
function giorniTra(dataDa, dataA) {
  const [y1, m1, d1] = dataDa.split('-').map(Number);
  const [y2, m2, d2] = dataA.split('-').map(Number);
  const t1 = new Date(y1, m1 - 1, d1).getTime();
  const t2 = new Date(y2, m2 - 1, d2).getTime();
  return Math.round((t2 - t1) / 86400000);
}

module.exports = { isoWeek, settimanaCorrente, meseCorrente, giorniTra };
