/* Shared query and source interpretation for the ten Unidad de Cumplimiento views. */
(function (global) {
  'use strict';
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  function status(value) {
    const key = normalize(value);
    if (key === 'en ejecucion (segun secop)') return 'En ejecución (según SECOP)';
    if (key === 'en ejecucion') return 'En ejecución';
    return String(value ?? '').trim();
  }
  function vereda(value) {
    const key = normalize(value);
    return !key || /^(ver |consultar |base de datos)/.test(key) ? null : String(value).trim();
  }
  function matches(row, state = {}) {
    for (const [filter, field] of [['meta', 'meta'], ['year', 'year'], ['sector', 'sectorMGA']]) {
      const value = state[filter];
      if (value && value !== 'all' && (value === 'none' ? Boolean(row[field]) : String(row[field] ?? '') !== value)) return false;
    }
    if (state.status && state.status !== 'all' && (state.status === 'none' ? Boolean(row.contractStatus) : normalize(status(row.contractStatus)) !== normalize(state.status))) return false;
    return !state.q || normalize([row.name, row.bpin, row.contract, row.vereda, row.sectorMGA, row.phase, row.item].join(' ')).includes(normalize(state.q));
  }
  // Accept DMS source strings only. A parsed coordinate is still not a certified work location.
  function coordinate(value) {
    const match = normalize(value).match(/n\s*(\d{1,2})\D+(\d{1,2})\D+(\d+(?:[.,]\d+)?)\D+[ow]\s*(\d{1,3})\D+(\d{1,2})\D+(\d+(?:[.,]\d+)?)/);
    if (!match) return null;
    const n = match.slice(1).map(v => Number(v.replace(',', '.')));
    if (n.some(v => !Number.isFinite(v)) || [n[1], n[2], n[4], n[5]].some(v => v >= 60)) return null;
    const lat = n[0] + n[1] / 60 + n[2] / 3600, lon = -(n[3] + n[4] / 60 + n[5] / 3600);
    return lat >= 4.8 && lat <= 5.2 && lon >= -74.4 && lon <= -74 ? { lat, lon, certified: false } : null;
  }
  function prepare(row) {
    return { ...row, contractStatusRaw: row.contractStatus, veredaRaw: row.vereda, contractStatus: status(row.contractStatus), vereda: vereda(row.vereda) };
  }
  global.TI42Core = Object.freeze({ normalize, status, vereda, matches, coordinate, prepare });
})(window);
