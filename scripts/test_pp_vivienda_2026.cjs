'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const text = p => fs.readFileSync(path.join(root, p), 'utf8');
const page = text('index.html');
const js = text('js/pp-vivienda-2026.js');
const css = text('css/pp-vivienda-2026.css');
const data = JSON.parse(text('data/pp-vivienda-2026-resumen.json'));
assert.match(page, /css\/pp-vivienda-2026\.css/);
assert.match(page, /js\/pp-vivienda-2026\.js/);
assert.match(js, /ti-practica-embed/, 'Solo el iframe institucional debe montar Vivienda.');
assert.match(js, /TISubachoqueMap/, 'Se debe usar el motor cartográfico original.');
assert.match(js, /getInstance/, 'La instancia de mapa debe preservarse.');
assert.doesNotMatch(js, /new\s+L\.Map\s*\(|L\.map\s*\(/, 'No construir un mapa alternativo.');
assert.match(js, /PP_HOUSING_REQUEST/);
assert.match(js, /PP_HOUSING_DATA/);
assert.match(js, /data-explorando/);
assert.match(css, /\.ppv-map-slot/);
assert.match(css, /\.ppv-source-section/);
assert.equal(data.totals.visited, 69);
assert.equal(data.totals.surveys, 66);
assert.equal(data.totals.prioritized, 41);
assert.deepEqual(Object.fromEntries(data.classification.map(c => [c.key,c.count])), {
 priorizada:41, espera:8, revision:5, descartada:12,
});
assert.equal(data.classification.reduce((n,c) => n+c.count,0),66);
assert.deepEqual(Object.fromEntries(data.improvements.map(c => [c.key,c.count])),{
 cocina:22,'baño':16,pisos:23
});
assert.ok(data.sources.length>=4);
assert.ok(data.sources.every(s => s.publicFile===false),'No publicar PDFs/XLSX privados.');
assert.doesNotMatch(JSON.stringify(data), /-74\.\d{4,}|4\.\d{4,}/, 'No colocar coordenadas individuales en resumen público.');
console.log('VIVIENDA 2026: estructura, procedencia, privacidad y contratos: PASS');
