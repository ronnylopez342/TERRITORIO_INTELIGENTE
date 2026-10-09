'use strict';

// Data parsing is shared by tables, charts and geographic imports.
const TIData = (() => {
  const key = value => String(value ?? '').replace(/^\uFEFF/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  function number(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    let text = String(value ?? '').trim().replace(/\u2212/g, '-').replace(/[\s\u00a0]/g, '');
    text = text.replace(/^(?:COP|\$)/i, '').replace(/(?:%|personas|hogares|habitantes|km|d[ií]as|min|consultas)$/i, '');
    if (!/^[+-]?(?:\d[\d.,]*|[.,]\d+)$/.test(text)) return null;
    const comma = text.lastIndexOf(','), dot = text.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) {
      const decimal = comma > dot ? ',' : '.';
      const thousand = decimal === ',' ? '.' : ',';
      const parts = text.split(decimal);
      if (parts.length !== 2 || !/^[0-9]+$/.test(parts[1])) return null;
      if (!new RegExp('^[+-]?\\d{1,3}(?:\\' + thousand + '\\d{3})*$').test(parts[0])) return null;
      text = parts[0].split(thousand).join('') + '.' + parts[1];
    } else if (comma >= 0) {
      // Spanish decimal comma; grouped commas are accepted only in complete groups.
      if ((text.match(/,/g) || []).length > 1) {
        if (!/^[+-]?\d{1,3}(,\d{3})+$/.test(text)) return null;
        text = text.replace(/,/g, '');
      } else text = text.replace(',', '.');
    } else if (dot >= 0) {
      // In Colombian text, 17.840 is seventeen thousand eight hundred forty.
      if (/^[+-]?\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
      else if ((text.match(/\./g) || []).length > 1) return null;
    }
    const result = Number(text);
    return Number.isFinite(result) ? result : null;
  }
  function csv(text) {
    text = String(text).replace(/^\uFEFF/, '');
    const firstLine = text.split(/\r?\n/, 1)[0];
    const count = delimiter => { let n = 0, quoted = false; for (let i = 0; i < firstLine.length; i++) { if (firstLine[i] === '"') { if (quoted && firstLine[i + 1] === '"') i++; else quoted = !quoted; } else if (!quoted && firstLine[i] === delimiter) n++; } return n; };
    const delimiter = [',', ';', '\t'].sort((a, b) => count(b) - count(a))[0];
    const records = []; let row = [], cell = '', quoted = false, closed = false;
    const finish = () => { row.push(cell); if (row.some(v => v.trim())) records.push(row); row = []; cell = ''; closed = false; };
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } } else cell += ch; }
      else if (ch === '"' && !cell && !closed) quoted = true;
      else if (ch === delimiter) { row.push(cell); cell = ''; closed = false; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; finish(); }
      else if (closed && !/\s/.test(ch)) throw new Error('CSV inválido: contenido después de cerrar comillas.');
      else if (!closed) { if (ch === '"') throw new Error('CSV inválido: comillas dentro de un campo sin delimitar.'); cell += ch; }
    }
    if (quoted) throw new Error('CSV inválido: hay comillas sin cerrar.');
    finish();
    if (records.length < 2) throw new Error('El archivo debe contener encabezados y al menos un registro.');
    const headers = records.shift().map(v => v.trim());
    if (headers.some(v => !v) || new Set(headers.map(key)).size !== headers.length) throw new Error('Los encabezados deben ser únicos y no estar vacíos.');
    return records.map((cells, i) => { if (cells.length !== headers.length) throw new Error(`Fila ${i + 2}: ${cells.length} columnas; se esperaban ${headers.length}.`); return Object.fromEntries(headers.map((h, j) => [h, cells[j]])); });
  }
  function dataset(input) {
    const rows = Array.isArray(input) ? input : input?.rows;
    if (!Array.isArray(rows) || !rows.length) throw new Error('La base debe contener una lista de registros.');
    if (rows.length > 20000) throw new Error('Importa hasta 20.000 registros por base.');
    const required = ['sector', 'indicador', 'valor', 'periodo', 'fuente'];
    return rows.map((row, i) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Registro ${i + 1}: formato inválido.`);
      const pairs = Object.entries(row).map(([name, value]) => [key(name), value]);
      if (new Set(pairs.map(x => x[0])).size !== pairs.length) throw new Error(`Registro ${i + 1}: columnas duplicadas.`);
      const normalized = Object.fromEntries(pairs);
      for (const field of required) if (normalized[field] === undefined || String(normalized[field]).trim() === '') throw new Error(`Registro ${i + 1}: falta ${field}.`);
      return Object.fromEntries([...required, 'unidad', 'vereda'].map(field => [field, normalized[field] ?? '']));
    });
  }
  function points(input) {
    let rows;
    if (input?.type === 'FeatureCollection') rows = input.features.map(f => { if (f.geometry?.type !== 'Point') throw new Error('La capa debe contener geometrías Point.'); return {...f.properties, longitud: f.geometry.coordinates[0], latitud: f.geometry.coordinates[1]}; });
    else rows = Array.isArray(input) ? input : input?.rows;
    if (!Array.isArray(rows) || !rows.length || rows.length > 5000) throw new Error('Carga entre 1 y 5.000 puntos.');
    return rows.map((row, i) => {
      const values = Object.fromEntries(Object.entries(row).map(([k, v]) => [key(k), v]));
      const latitude = number(values.latitud ?? values.latitude ?? values.lat);
      const longitude = number(values.longitud ?? values.longitude ?? values.lon ?? values.lng);
      if (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error(`Punto ${i + 1}: latitud o longitud inválida.`);
      return {nombre: String(values.nombre ?? values.name ?? `Punto ${i + 1}`), latitud: latitude, longitud: longitude, tipo: String(values.tipo ?? values.servicio ?? 'Punto'), vereda: String(values.vereda ?? ''), descripcion: String(values.descripcion ?? '')};
    });
  }
  let database;
  function db() {
    if (!database) database = new Promise((resolve, reject) => {
      const request = indexedDB.open('territorio-inteligente-local', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('records');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { database = null; reject(new Error('No se pudo abrir el guardado en este navegador.')); };
      request.onblocked = () => { database = null; reject(new Error('Cierra otras pestañas de Territorio Inteligente para habilitar el guardado.')); };
    });
    return database;
  }
  async function read(name) {
    const database = await db();
    return new Promise((resolve, reject) => { const request = database.transaction('records', 'readonly').objectStore('records').get(name); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(new Error('No se pudo leer el contenido guardado.')); });
  }
  async function write(name, value) {
    const database = await db();
    return new Promise((resolve, reject) => { const transaction = database.transaction('records', 'readwrite'); transaction.objectStore('records').put(value, name); transaction.oncomplete = () => resolve(); transaction.onerror = transaction.onabort = () => reject(new Error('No se pudo guardar. Revisa el espacio y los permisos del navegador; el contenido anterior se conserva.')); });
  }
  return {number, csv, dataset, points, read, write, key};
})();
if (typeof module !== 'undefined') module.exports = TIData;
