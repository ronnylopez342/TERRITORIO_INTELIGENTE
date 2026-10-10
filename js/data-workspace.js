'use strict';

// Uploaded content remains on this device until a shared institutional service is connected.
const TIWorkspace = (() => {
  let documents = [], publications = [], points = [], storageError = '';
  const html = value => escapeHtml(value);
  const format = value => new Intl.NumberFormat('es-CO', {maximumFractionDigits: 6}).format(value);
  const savedNote = 'Guardado en este navegador. Se conserva al recargar; no se publica ni se comparte con otros usuarios.';
  const report = error => openDetail('No se pudo completar la carga', `<p>${html(error.message)}</p>`);
  async function restore() {
    try {
      for (const name of ['dane', 'nacional', 'departamental', 'municipales', 'encuesta']) {
        const record = await TIData.read(`dataset:${name}`);
        if (record) TI_STATE.imported[name] = record;
      }
      documents = await TIData.read('documents') || [];
      publications = await TIData.read('publications') || [];
      points = await TIData.read('points') || [];
    } catch (error) { storageError = error.message; }
  }
  async function fileRows(file) {
    if (file.size > 25 * 1024 * 1024) throw new Error('El archivo supera 25 MB.');
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'csv') return TIData.csv(await file.text());
    if (extension === 'json' || extension === 'geojson') return JSON.parse(await file.text());
    if (['xlsx', 'xls'].includes(extension)) {
      if (!window.XLSX) throw new Error('No se pudo cargar el lector de Excel. Puedes importar CSV o JSON.');
      const workbook = XLSX.read(await file.arrayBuffer(), {type: 'array'});
      return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {defval: ''});
    }
    throw new Error('Formato no soportado. Usa Excel, CSV o JSON.');
  }
  function workspace(key) {
    const root = document.querySelector(`[data-dataset-workspace="${key}"]`);
    if (!root) return;
    const source = () => key === 'externas' ? TI_STATE.sourceLevel : key;
    root.innerHTML = `<div class="dataset-controls"><label>Sector<select aria-label="Sector"><option value="">Todos los sectores</option></select></label><label class="action-button">Importar Excel / CSV / JSON<input type="file" accept=".xlsx,.xls,.csv,.json" hidden aria-label="Importar base ${key}"></label><button type="button" class="text-button" data-export-dataset>Exportar CSV</button><button type="button" class="text-button" data-template>Plantilla CSV</button></div><p class="ti-storage-note" role="status"></p><div class="dataset-summary"><div class="data-table-wrap"></div><div class="chart-panel"></div></div><p class="local-only-note">${savedNote}</p>`;
    const select = root.querySelector('select'), upload = root.querySelector('input');
    root.tiRefresh = () => {
      const names = [...new Set((TI_STATE.imported[source()]?.rows || []).map(row => String(row.sector)))];
      const current = select.value;
      select.innerHTML = `<option value="">Todos los sectores</option>${names.map(name => `<option>${html(name)}</option>`).join('')}`;
      if (names.includes(current)) select.value = current;
      renderDataset(root, source(), select.value);
    };
    select.onchange = () => renderDataset(root, source(), select.value);
    upload.onchange = async () => {
      const file = upload.files[0]; if (!file) return;
      const name = source();
      upload.disabled = true;
      try {
        const record = {rows: TIData.dataset(await fileRows(file)), fileName: file.name, updated: new Date().toISOString()};
        await TIData.write(`dataset:${name}`, record);
        TI_STATE.imported[name] = record;
        root.tiRefresh();
        openDetail('Base guardada', `<p>${record.rows.length} registros de ${html(file.name)}.</p><p>${savedNote}</p>`);
      } catch (error) { report(error); }
      finally { upload.disabled = false; upload.value = ''; }
    };
    root.querySelector('[data-export-dataset]').onclick = () => {
      const rows = TI_STATE.imported[source()]?.rows || [];
      if (!rows.length) return;
      downloadBlob(`${source()}.csv`, '\uFEFF' + rowsToCsv(rows), 'text/csv;charset=utf-8');
    };
    root.querySelector('[data-template]').onclick = () => downloadBlob('plantilla-indicadores.csv', '\uFEFFsector,indicador,valor,periodo,fuente,unidad,vereda\r\n', 'text/csv;charset=utf-8');
    root.tiRefresh();
  }
  function renderDataset(root, key, sector) {
    const record = TI_STATE.imported[key];
    const rows = (record?.rows || []).filter(row => !sector || String(row.sector) === sector);
    const note = root.querySelector('.ti-storage-note');
    note.textContent = record ? `${record.fileName} · ${record.rows.length} registros · guardado ${dateLabel(record.updated)}` : storageError || 'Sin base cargada para esta fuente. Importa datos con sector, indicador, valor, periodo y fuente; unidad y vereda son opcionales.';
    root.querySelector('[data-export-dataset]').disabled = !rows.length;
    let page = 0;
    const table = root.querySelector('.data-table-wrap');
    const draw = () => {
      const start = page * 80, visible = rows.slice(start, start + 80);
      table.innerHTML = rows.length ? `<table class="data-table"><thead><tr>${['Sector', 'Indicador', 'Valor', 'Unidad', 'Periodo', 'Fuente'].map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${visible.map(row => `<tr>${['sector', 'indicador', 'valor', 'unidad', 'periodo', 'fuente'].map(field => `<td>${html(row[field])}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="ti-table-pagination"><button type="button" data-prev ${page === 0 ? 'disabled' : ''}>Anterior</button><span>${start + 1}–${Math.min(start + 80, rows.length)} de ${rows.length}</span><button type="button" data-next ${start + 80 >= rows.length ? 'disabled' : ''}>Siguiente</button></div>` : '<p class="empty-state">No hay registros disponibles para esta selección.</p>';
      table.querySelector('[data-prev]')?.addEventListener('click', () => { page--; draw(); });
      table.querySelector('[data-next]')?.addEventListener('click', () => { page++; draw(); });
    };
    draw();
    const chart = root.querySelector('.chart-panel'), groups = new Map();
    rows.forEach(row => {
      const value = TIData.number(row.valor);
      if (value === null) return;
      const unit = String(row.unidad || (String(row.valor).includes('%') ? '%' : '')).trim();
      const id = JSON.stringify([row.sector, row.indicador, unit, row.vereda || '', row.fuente]);
      if (!groups.has(id)) groups.set(id, {title: `${row.indicador} · ${row.sector}${row.vereda ? ' · ' + row.vereda : ''} · ${row.fuente}`, unit, entries: []});
      groups.get(id).entries.push({row, value});
    });
    const list = [...groups.values()];
    if (!list.length) { chart.innerHTML = '<p class="empty-state">La gráfica aparecerá cuando existan valores numéricos. Los valores no numéricos se conservan en la tabla.</p>'; return; }
    chart.innerHTML = `<label>Indicador<select aria-label="Indicador de la gráfica">${list.map((group, i) => `<option value="${i}">${html(group.title)}${group.unit ? ' (' + html(group.unit) + ')' : ''}</option>`).join('')}</select></label><div class="ti-indicator-chart"></div><p class="prototype-caption">Cada gráfica compara el mismo indicador, fuente, territorio y unidad. Los datos importados conservan su fuente declarada y requieren validación institucional.</p>`;
    const paint = () => {
      const group = list[Number(chart.querySelector('select').value)];
      const entries = [...group.entries].sort((a, b) => String(a.row.periodo).localeCompare(String(b.row.periodo), 'es', {numeric: true}));
      const maximum = Math.max(...entries.map(entry => Math.abs(entry.value)), 1);
      const limited = entries.slice(0, 80);
      const hasNegative = entries.some(entry => entry.value < 0);
      chart.querySelector('.ti-indicator-chart').innerHTML = `<h4>${html(group.title)}</h4><div class="bar-chart">${limited.map(({row, value}) => `<div class="bar-row"><span>${html(row.periodo)}</span>${hasNegative ? '' : `<div class="bar-track"><div class="bar-fill" style="width:${(value / maximum * 100).toFixed(2)}%"></div></div>`}<strong>${format(value)}${group.unit ? ' ' + html(group.unit) : ''}</strong></div>`).join('')}</div>${entries.length > 80 ? `<p>Mostrando los primeros 80 de ${entries.length} valores. Todos están disponibles en la tabla y exportación.</p>` : ''}${hasNegative ? '<p>Serie con valores negativos: se muestran los valores con su signo.</p>' : ''}`;
    };
    chart.querySelector('select').onchange = paint;
    paint();
  }
  function sources() {
    const sources = TI_STATE.baseData.sources || [];
    const registry = list => list.map(source => `<span class="source-chip"><a href="${html(source.url)}" target="_blank" rel="noopener">${html(source.name)} ↗</a> · ${html(source.periodicity)}</span>`).join('') + '<p>Catálogo de fuentes. Los enlaces no implican que sus bases estén integradas automáticamente.</p>';
    const daneRegistry = document.getElementById('daneSourceRegistry');
    if (!daneRegistry) return;
    daneRegistry.innerHTML = registry(sources.filter(source => source.id === 'dane'));
    const refresh = () => {
      document.getElementById('externalSourceRegistry').innerHTML = registry(sources.filter(source => source.level === TI_STATE.sourceLevel));
      document.querySelector('[data-dataset-workspace="externas"]')?.tiRefresh?.();
    };
    refresh();
    document.querySelectorAll('[data-source-level]').forEach(button => { button.onclick = () => { TI_STATE.sourceLevel = button.dataset.sourceLevel; document.querySelectorAll('[data-source-level]').forEach(item => item.classList.toggle('active', item === button)); refresh(); }; });
  }
  function downloadFile(file) {
    const url = URL.createObjectURL(file.blob), link = document.createElement('a');
    link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function viewFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const url = URL.createObjectURL(file.blob);
    if (extension === 'pdf') openDetail(file.name, `<iframe class="ti-document-preview" title="${html(file.name)}" src="${url}"></iframe>`);
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) openDetail(file.name, `<img class="ti-document-image" src="${url}" alt="${html(file.name)}">`);
    else { URL.revokeObjectURL(url); downloadFile(file); return; }
    document.getElementById('detailDialog').addEventListener('close', () => URL.revokeObjectURL(url), {once: true});
  }
  function fileLibrary(kind) {
    const root = document.getElementById(kind === 'documents' ? 'statDocumentGrid' : 'publicationGrid');
    if (!root) return;
    const get = () => kind === 'documents' ? documents : publications;
    const draw = () => {
      const query = kind === 'documents' ? (document.getElementById('statDocumentSearch')?.value || '').toLowerCase() : '';
      const list = get().filter(file => file.name.toLowerCase().includes(query));
      root.innerHTML = list.map(file => `<article class="document-card"><small>${html(file.name.split('.').pop().toUpperCase())} · ${format(file.blob.size / 1024)} KB</small><h4>${html(file.name)}</h4><p>Cargado ${html(dateLabel(file.created))}</p><div class="card-actions"><button type="button" class="text-button" data-local-view="${html(file.id)}">${/\.(pdf|png|jpe?g|webp)$/i.test(file.name) ? 'Ver archivo' : 'Abrir archivo'}</button><button type="button" class="text-button" data-local-download="${html(file.id)}">Descargar original</button></div></article>`).join('') || '<p class="empty-state">No hay archivos cargados que coincidan con esta selección.</p>';
      root.querySelectorAll('[data-local-view]').forEach(button => { button.onclick = () => viewFile(get().find(file => file.id === button.dataset.localView)); });
      root.querySelectorAll('[data-local-download]').forEach(button => { button.onclick = () => downloadFile(get().find(file => file.id === button.dataset.localDownload)); });
    };
    draw();
    document.getElementById('statDocumentSearch')?.addEventListener('input', draw);
    const input = document.getElementById(kind === 'documents' ? 'statDocumentUpload' : 'publicationUpload');
    if (input) input.onchange = async () => {
      const files = [...input.files]; if (!files.length) return;
      input.disabled = true;
      try {
        for (const file of files) {
          if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name}: el máximo por archivo es 25 MB.`);
          if (!/\.(pdf|xlsx?|csv|json|docx|txt|png|jpe?g|webp)$/i.test(file.name)) throw new Error(`${file.name}: formato no admitido.`);
        }
        const list = [...get(), ...files.map(file => ({id: crypto.randomUUID(), name: file.name, blob: file, created: new Date().toISOString()}))];
        await TIData.write(kind, list);
        if (kind === 'documents') documents = list; else publications = list;
        draw();
        // Dentro de la nueva administración editorial, no abrimos un segundo modal
        // encima del gestor: el estado de carga se comunica en su propio panel.
        if(kind==='publications') document.dispatchEvent(new CustomEvent('ti:publication-store-changed'));
        if(kind==='publications' && document.getElementById('pubManageDialog')?.open){
          const note=document.getElementById('pubReviewAlert');
          if(note)note.textContent=`${files.length} archivo(s) incorporado(s). ${savedNote}`;
        } else openDetail('Archivos guardados', `<p>${files.length} archivo(s) incorporado(s) al repositorio.</p><p>${savedNote}</p>`);
      } catch (error) { report(error); }
      finally { input.disabled = false; input.value = ''; }
    };
  }
  function map() {
    const svg = document.getElementById('territoryMapSvg'), detail = document.getElementById('territoryMapDetail');
    if (!svg || !detail) return;
    const features = TI_STATE.geo.features || [], coords = [];
    features.forEach(feature => walkCoords(feature.geometry.coordinates, coord => coords.push(coord)));
    const xs = coords.map(coord => coord[0]), ys = coords.map(coord => coord[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min(904 / (maxX - minX), 544 / (maxY - minY));
    const project = ([x, y]) => [480 + (x - (minX + maxX) / 2) * scale, 300 - (y - (minY + maxY) / 2) * scale];
    let selected = 0;
    const inRing = (point, ring) => { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > point[1]) !== (yj > point[1]) && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi) inside = !inside; } return inside; };
    const contains = (feature, point) => { const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates; return polygons.some(polygon => inRing(point, polygon[0]) && !polygon.slice(1).some(ring => inRing(point, ring))); };
    const names = points.map(point => features.find(feature => contains(feature, [point.longitud, point.latitud]))?.properties.nombre || 'Fuera de la capa municipal');
    const show = index => {
      selected = index;
      const name = features[index]?.properties.nombre;
      if (!name) return;
      svg.querySelectorAll('.map-vereda').forEach((path, i) => path.classList.toggle('active', i === index));
      const list = points.filter((point, i) => names[i] === name);
      detail.innerHTML = `<p class="eyebrow">${html(name)}</p><h3>${html(name)}</h3><p>${list.length} puntos cargados en esta zona.</p><p>Los límites geográficos no acreditan cobertura, población o beneficiarios. Estos resultados necesitan una base municipal validada.</p>${list.map(point => `<article><strong>${html(point.nombre)}</strong><p>${html(point.tipo)} · ${html(point.descripcion)}</p></article>`).join('')}<button type="button" class="text-button" data-map-export>Descargar puntos de esta zona</button>`;
      detail.querySelector('[data-map-export]').onclick = () => downloadBlob(`puntos-${name}.json`, JSON.stringify(list, null, 2));
    };
    const paint = () => {
      svg.innerHTML = features.map((feature, i) => `<path class="map-vereda" tabindex="0" role="button" data-vereda-index="${i}" aria-label="${html(feature.properties.nombre)}" d="${geometryPath(feature.geometry, project)}"></path>`).join('') + points.map((point, i) => {
        const [x, y] = project([point.longitud, point.latitud]);
        if (x < 0 || x > 960 || y < 0 || y > 600) return '';
        return `<circle class="ti-map-point" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="7" tabindex="0" role="button" data-point-index="${i}" aria-label="${html(point.nombre)}"><title>${html(point.nombre)}</title></circle>`;
      }).join('');
      show(selected);
      const status = document.getElementById('geoUploadStatus');
      if (status) status.textContent = `${points.length} puntos guardados · ${names.filter(name => name === 'Fuera de la capa municipal').length} fuera de los límites de la capa. ${savedNote}`;
    };
    const activate = target => {
      const area = target.closest('[data-vereda-index]'), marker = target.closest('[data-point-index]');
      if (area) show(Number(area.dataset.veredaIndex));
      if (marker) { const i = Number(marker.dataset.pointIndex), point = points[i]; openDetail(point.nombre, `<p>${html(point.tipo)} · ${html(names[i])}</p><p>${html(point.descripcion)}</p><p>Latitud: ${point.latitud} · Longitud: ${point.longitud}</p>`); }
    };
    svg.onclick = event => activate(event.target);
    svg.onkeydown = event => { if (['Enter', ' '].includes(event.key) && event.target.matches('[data-vereda-index], [data-point-index]')) { event.preventDefault(); activate(event.target); } };
    paint();
    const upload = document.getElementById('geoPointUpload');
    if (upload) upload.onchange = async () => {
      const file = upload.files[0]; if (!file) return;
      upload.disabled = true;
      try { const next = TIData.points(await fileRows(file)); await TIData.write('points', next); points = next; names.splice(0, names.length, ...points.map(point => features.find(feature => contains(feature, [point.longitud, point.latitud]))?.properties.nombre || 'Fuera de la capa municipal')); paint(); openDetail('Capa guardada', `<p>${points.length} puntos cargados.</p><p>${savedNote}</p>`); }
      catch (error) { report(error); }
      finally { upload.disabled = false; upload.value = ''; }
    };
  }
  function glossary() {
    const list = document.getElementById('glossaryList'), search = document.getElementById('glossarySearch');
    if (!list || !search) return;
    const rows = TI_STATE.demo.data.glossary || [];
    const draw = () => { const query = search.value.toLowerCase(); list.innerHTML = rows.filter(row => `${row.term} ${row.definition} ${row.source}`.toLowerCase().includes(query)).map(row => `<article class="glossary-entry"><h4>${html(row.term)}</h4><p>${html(row.definition)}</p><p>Fuente declarada: ${html(row.source)}</p></article>`).join('') || '<p>No hay términos que coincidan.</p>'; };
    draw(); search.oninput = draw;
  }
  return {restore, fileRows, workspace, renderDataset, sources, documents: () => fileLibrary('documents'), publications: () => fileLibrary('publications'), map, glossary};
})();
