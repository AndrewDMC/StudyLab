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

module.exports = { isoWeek, settimanaCorrente, meseCorrente };
