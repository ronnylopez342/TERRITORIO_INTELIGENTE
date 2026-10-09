'use strict';
const assert = require('node:assert/strict');
const data = require('../js/data-core.js');

// Colombian display strings and numeric Excel cells must retain their magnitude.
for (const [input, expected] of [[17840,17840], ['17.840',17840], ['5.420',5420], ['3,29',3.29], ['17.840,25',17840.25], ['17,840.25',17840.25], ['0',0], ['0%',0], ['-74,172',-74.172], ['2,1 días',2.1], ['94%',94], ['0,001',0.001], ['1.234.567',1234567]]) assert.equal(data.number(input), expected, String(input));
for (const input of ['', null, 's/d', '78/100', '1.2.3', '1.25,3', Infinity]) assert.equal(data.number(input), null);

// CSV round-trips must preserve quoted commas, decimal commas and multiline fields.
assert.deepEqual(data.csv('\uFEFFsector;indicador;valor;periodo;fuente\r\nSalud;"Consulta; promedio";"2,1";2026;"Equipo\nmunicipal"'), [{sector:'Salud',indicador:'Consulta; promedio',valor:'2,1',periodo:'2026',fuente:'Equipo\nmunicipal'}]);
assert.deepEqual(data.csv('a,b\n"Una, dos","Dijo ""hola"""'), [{a:'Una, dos',b:'Dijo "hola"'}]);
assert.deepEqual(data.csv('a\tb\nuno\tdos'), [{a:'uno',b:'dos'}]);
for (const invalid of ['a,b\n1', 'a,a\n1,2', 'a,b\n"sin cerrar,2', 'a,b\n"x"y,2', 'a,b\n1,2,3', 'a,b']) assert.throws(() => data.csv(invalid));
const row = {Sector:'Salud',Indicador:'Casos',Valor:0,'Período':2026,Fuente:'Registro local'};
assert.equal(data.dataset([row])[0].valor, 0);
assert.equal(data.dataset([row])[0].periodo, 2026);
assert.throws(() => data.dataset([{...row, Fuente:''}]));
assert.throws(() => data.dataset({}));
assert.deepEqual(data.points({type:'FeatureCollection',features:[{type:'Feature',properties:{nombre:'Escuela'},geometry:{type:'Point',coordinates:[-74.172,4.932]}}]})[0], {nombre:'Escuela',longitud:-74.172,latitud:4.932,tipo:'Punto',vereda:'',descripcion:''});
assert.equal(data.points([{nombre:'Hospital',latitud:'4,932',longitud:'-74,172'}])[0].longitud,-74.172);
assert.throws(() => data.points([{latitud:91,longitud:0}]));
assert.throws(() => data.points([{latitud:'',longitud:0}]));
assert.throws(() => data.points({type:'FeatureCollection',features:[{geometry:{type:'Polygon',coordinates:[]}}]}));
console.log('Data parsing checks passed: numbers, CSV, headers, datasets and geographic points.');
