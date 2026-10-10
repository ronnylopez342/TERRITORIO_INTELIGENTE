/* Territorio Inteligente / Data 2.2: Plan Estadistico Municipal.
   Los archivos oficiales requieren enlaces verificados; los registros manuales
   y adjuntos existentes solo persisten en este navegador, NO en la Alcaldia. */
(() => {
  'use strict';
  const root = document.getElementById('data-plan-estadistico');
  if (!root) return;
  const home = document.getElementById('peHome');
  const detail = document.getElementById('peDetail');
  const detailTitle = document.getElementById('peDetailTitle');
  const detailDescription = document.getElementById('peDetailDescription');
  const message = document.getElementById('peMessage');
  const panelNames = {
    documentos: ['Documentos oficiales', 'Consulta el repositorio técnico y los archivos incorporados en este navegador.'],
    indicadores: ['Indicadores del plan', 'Registra variables, fuentes, periodicidad y reglas de cálculo.'],
    fichas: ['Fichas técnicas', 'Definiciones, fórmulas, fuentes y responsables de cada indicador registrado.'],
    seguimiento: ['Seguimiento y reportes', 'Revisa vencimientos y prepara reportes para planeación y MIPG.']
  };
  const sectors = [
    'Demografía y población', 'Salud', 'Educación', 'Economía',
    'Convivencia y seguridad', 'Acceso a servicios públicos',
    'Vivienda', 'Vías', 'Ordenamiento territorial', 'Medición institucional'
  ];
  const periods = {
    mensual: 31, trimestral: 92, semestral: 184,
    anual: 366, quinquenal: 1830, eventual: null
  };
  const storeKey = 'ti-plan-estadistico-indicadores-v1';
  const allowFormula = ['valor', 'porcentaje', 'tasa', 'diferencia', 'promedio'];
  let records = [];
  let editingId = null;
  let currentView = '';
  let officialDocuments = [];
  let videoURL = '';

  const escapeHtml = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const nowISO = () => {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  };
  const numeric = value => {
    if (value == null || String(value).trim() === '') return NaN;
    return Number(String(value).trim().replace(',', '.'));
  };
  const fmt = value => Number.isFinite(value)
    ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 3 }).format(value)
    : 'Sin valor';
  function notice(text) {
    message.textContent = text;
  }
  function loadRecords() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storeKey) || '[]');
      records = Array.isArray(parsed) ? parsed.filter(item => item && item.id && item.nombre) : [];
    } catch (error) {
      records = [];
      notice('No fue posible leer los indicadores de este navegador.');
    }
  }
  function saveRecords(next) {
    try {
      localStorage.setItem(storeKey, JSON.stringify(next));
      records = next;
      return true;
    } catch (error) {
      notice('No fue posible guardar los datos localmente. Comprueba el espacio disponible o los permisos del navegador.');
      return false;
    }
  }
  function calculate(item) {
    const a = numeric(item.numerador);
    const b = numeric(item.denominador);
    if (!Number.isFinite(a)) return { value: null, error: 'Falta el valor principal' };
    if (item.formula === 'valor') return { value: a, error: '' };
    if (item.formula === 'diferencia') {
      if (!Number.isFinite(b)) return { value: null, error: 'Falta el valor base' };
      return { value: a - b, error: '' };
    }
    if (!Number.isFinite(b) || b === 0) return { value: null, error: 'El denominador debe ser distinto de cero' };
    if (item.formula === 'porcentaje') return { value: 100 * a / b, error: '' };
    if (item.formula === 'promedio') return { value: a / b, error: '' };
    if (item.formula === 'tasa') {
      const factor = numeric(item.factor);
      if (!Number.isFinite(factor) || factor <= 0) return { value: null, error: 'El factor debe ser mayor que cero' };
      return { value: factor * a / b, error: '' };
    }
    return { value: null, error: 'Fórmula no reconocida' };
  }
  function status(item) {
    if (!item.fecha) return { type: 'pending', text: 'Sin fecha de actualización', detail: 'Registrar fecha' };
    const date = new Date(item.fecha + 'T12:00:00');
    if (!Number.isFinite(date.getTime())) return { type: 'pending', text: 'Fecha no válida', detail: 'Corregir fecha' };
    const deadline = periods[item.periodicidad];
    if (deadline === null || !Number.isFinite(deadline)) return { type: 'pending', text: 'Revisión manual', detail: 'Periodicidad eventual' };
    const today = new Date(nowISO() + 'T12:00:00');
    const elapsed = Math.floor((today - date) / 86400000);
    if (elapsed > deadline) return { type: 'late', text: 'Sin actualización', detail: 'Venció la periodicidad definida' };
    if (elapsed > deadline * 0.8) return { type: 'late', text: 'Próxima actualización', detail: 'La fecha de actualización está próxima' };
    return { type: 'good', text: 'Dentro del periodo', detail: 'Fecha dentro de la periodicidad' };
  }
  function formulaLabel(key) {
    return {
      valor: 'Valor directo', porcentaje: 'Porcentaje = A / B × 100',
      tasa: 'Tasa = A / B × factor', diferencia: 'Diferencia = A − B',
      promedio: 'Promedio = A / B'
    }[key] || 'Por definir';
  }
  function metadataComplete(item) {
    return Boolean(item.nombre && item.variable && item.fuente && item.metodologia && item.periodicidad && item.sector);
  }
  function validRecord(item) {
    return item.nombre && item.variable && item.fuente && item.metodologia &&
      sectors.includes(item.sector) && Object.prototype.hasOwnProperty.call(periods, item.periodicidad) &&
      allowFormula.includes(item.formula) && !calculate(item).error &&
      (!item.fecha || (/^\d{4}-\d{2}-\d{2}$/.test(item.fecha) && item.fecha <= nowISO()));
  }
  function showView(view, options = {}) {
    const selected = Object.prototype.hasOwnProperty.call(panelNames, view) ? view : '';
    currentView = selected;
    home.hidden = Boolean(selected);
    detail.hidden = !selected;
    for (const section of root.querySelectorAll('[data-pe-section]')) {
      section.hidden = section.dataset.peSection !== selected;
    }
    if (selected) {
      detailTitle.textContent = panelNames[selected][0];
      detailDescription.textContent = panelNames[selected][1];
    }
    if (options.history !== false && location.hash.startsWith('#data')) {
      const fragment = '#data?seccion=data-plan-estadistico' + (selected ? '&vista=' + encodeURIComponent(selected) : '');
      if (location.hash !== fragment) history.pushState({ route: 'data' }, '', fragment);
    }
    if (options.focus !== false) {
      requestAnimationFrame(() => {
        const bar = document.getElementById('siteHeader');
        const top = window.scrollY + root.getBoundingClientRect().top - (bar?.getBoundingClientRect().height || 90) - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
        const target = selected ? detailTitle : document.getElementById('pe-title');
        target?.focus({ preventScroll: true });
      });
    }
    if (selected === 'indicadores') renderIndicators();
    if (selected === 'fichas') renderSheets();
    if (selected === 'seguimiento') renderReports();
  }
  function syncFromHash() {
    if (!location.hash.startsWith('#data')) return;
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    if (params.get('seccion') !== 'data-plan-estadistico') {
      showView('', { history: false, focus: false });
      return;
    }
    showView(params.get('vista') || '', { history: false, focus: false });
  }
  function formHtml() {
    const option = (v, title) => '<option value="' + escapeHtml(v) + '">' + escapeHtml(title) + '</option>';
    const sectorOptions = '<option value="">Seleccionar sector</option>' + sectors.map(s => option(s, s)).join('');
    const periodOptions = '<option value="">Seleccionar periodicidad</option>' +
      Object.keys(periods).map(p => option(p, p.charAt(0).toUpperCase() + p.slice(1))).join('');
    return '<form id="peForm" class="pe-form" hidden>' +
      '<h3 id="peFormTitle">Nuevo indicador</h3>' +
      '<p class="pe-hint" style="margin:10px 0 20px">Registro de trabajo local. No se considera oficial hasta su validación institucional.</p>' +
      '<div class="pe-form-grid">' +
      '<label>Nombre del indicador *<input name="nombre" maxlength="180" required></label>' +
      '<label>Código / identificador<input name="codigo" maxlength="50"></label>' +
      '<label>Sector *<select name="sector" required>' + sectorOptions + '</select></label>' +
      '<label>Variable *<input name="variable" maxlength="170" required></label>' +
      '<label>Fuente de información *<input name="fuente" maxlength="200" required placeholder="Entidad / sistema de origen"></label>' +
      '<label>Periodicidad *<select name="periodicidad" required>' + periodOptions + '</select></label>' +
      '<label>Responsable<input name="responsable" maxlength="150"></label>' +
      '<label>Unidad de medida<input name="unidad" maxlength="40" placeholder="%, personas, km..."></label>' +
      '<label>Última actualización<input type="date" name="fecha" max="' + nowISO() + '"></label>' +
      '<label>Regla de cálculo<select name="formula">' +
      allowFormula.map(k => option(k, formulaLabel(k))).join('') + '</select></label>' +
      '<label>Valor A (numerador / valor observado) *<input type="number" step="any" name="numerador" required></label>' +
      '<label>Valor B (denominador / base)<input type="number" step="any" name="denominador"></label>' +
      '<label>Factor (solo para tasas)<input type="number" min="0.000001" step="any" name="factor" value="1000"></label>' +
      '<label class="pe-wide">Metodología / definición *<textarea name="metodologia" required maxlength="2500" placeholder="Explica el cálculo, el alcance y las condiciones de interpretación."></textarea></label>' +
      '<label class="pe-check-label pe-wide"><input type="checkbox" name="validado"> Validación interna confirmada (marcación manual; no equivale a certificación)</label>' +
      '</div><p class="pe-hint" id="peFormulaPreview" style="margin-top:14px" aria-live="polite"></p>' +
      '<div class="pe-form-actions"><button type="submit" class="pe-btn pe-btn-primary">Guardar indicador</button>' +
      '<button class="pe-btn" type="button" data-pe-cancel>Cancelar</button></div></form>';
  }
  function openForm(id) {
    const form = document.getElementById('peForm');
    form.hidden = false;
    editingId = id || null;
    form.reset();
    if (id) {
      const item = records.find(record => record.id === id);
      if (!item) return;
      for (const input of form.elements) {
        if (!input.name) continue;
        if (input.type === 'checkbox') input.checked = Boolean(item[input.name]);
        else input.value = item[input.name] == null ? '' : item[input.name];
      }
    } else {
      form.elements.namedItem('factor').value = '1000';
    }
    document.getElementById('peFormTitle').textContent = id ? 'Editar indicador' : 'Nuevo indicador';
    previewFormula();
    form.scrollIntoView({ block: 'start', behavior: 'smooth' });
    form.elements.namedItem('nombre').focus({ preventScroll: true });
  }
  function previewFormula() {
    const form = document.getElementById('peForm');
    if (!form) return;
    const item = Object.fromEntries(new FormData(form).entries());
    const result = calculate(item);
    document.getElementById('peFormulaPreview').textContent = result.error
      ? 'Cálculo pendiente: ' + result.error
      : 'Resultado calculado: ' + fmt(result.value) + ' ' + (item.unidad || '');
    const formula = item.formula;
    form.elements.namedItem('denominador').required = formula !== 'valor';
    form.elements.namedItem('factor').disabled = formula !== 'tasa';
  }
  function saveForm(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    data.validado = event.currentTarget.elements.namedItem('validado').checked;
    for (const key of ['nombre', 'codigo', 'sector', 'variable', 'fuente', 'periodicidad', 'responsable', 'unidad', 'fecha', 'formula', 'metodologia']) {
      data[key] = String(data[key] || '').trim();
    }
    data.denominador = String(data.denominador || '').trim();
    data.numerador = String(data.numerador || '').trim();
    data.factor = String(data.factor || '').trim();
    if (!validRecord(data)) {
      notice('Revisa la fuente, metodología, valores, periodicidad y fecha. No se guardó el indicador.');
      return;
    }
    data.id = editingId || (crypto.randomUUID ? crypto.randomUUID() : 'indicador-' + Date.now());
    data.registrado = records.find(item => item.id === editingId)?.registrado || new Date().toISOString();
    data.modificado = new Date().toISOString();
    const updated = editingId ? records.map(item => item.id === editingId ? data : item) : [...records, data];
    if (!saveRecords(updated)) return;
    document.getElementById('peForm').hidden = true;
    editingId = null;
    notice('Indicador guardado en este navegador. No se ha publicado en un repositorio institucional.');
    renderIndicators();
  }
  function matchesSearch(item, query) {
    return [item.nombre, item.variable, item.codigo, item.sector, item.fuente].join(' ').toLowerCase().includes(query);
  }
  function renderIndicators() {
    const body = document.getElementById('peIndicatorsBody');
    const empty = document.getElementById('peIndicatorsEmpty');
    const search = (document.getElementById('peIndicatorSearch')?.value || '').toLowerCase().trim();
    const filtered = records.filter(item => matchesSearch(item, search));
    body.innerHTML = filtered.map(item => {
      const state = status(item);
      const calculated = calculate(item);
      return '<tr>' +
        '<td><strong>' + escapeHtml(item.nombre) + '</strong><br><small>' + escapeHtml(item.codigo || item.variable) + '</small></td>' +
        '<td>' + escapeHtml(item.sector) + '</td>' +
        '<td>' + escapeHtml(item.fuente) + '</td>' +
        '<td>' + escapeHtml(item.periodicidad) + '</td>' +
        '<td>' + escapeHtml(fmt(calculated.value)) + ' ' + escapeHtml(item.unidad || '') + '</td>' +
        '<td><span class="pe-status ' + escapeHtml(state.type) + '">' + escapeHtml(state.text) + '</span></td>' +
        '<td><button type="button" data-pe-edit="' + escapeHtml(item.id) + '">Editar</button> · <button type="button" data-pe-delete="' + escapeHtml(item.id) + '">Eliminar</button></td>' +
        '</tr>';
    }).join('');
    empty.hidden = filtered.length > 0;
    document.getElementById('peIndicatorCount').textContent =
      records.length + (records.length === 1 ? ' indicador registrado localmente' : ' indicadores registrados localmente');
  }
  function renderSheets() {
    const container = document.getElementById('peSheetsGrid');
    const empty = document.getElementById('peSheetsEmpty');
    container.innerHTML = records.map(item => {
      const value = calculate(item);
      return '<article class="pe-ficha"><small>' + escapeHtml(item.codigo || item.sector) + '</small>' +
        '<h4>' + escapeHtml(item.nombre) + '</h4>' +
        '<p><strong>Variable:</strong> ' + escapeHtml(item.variable) + '</p>' +
        '<p><strong>Fuente:</strong> ' + escapeHtml(item.fuente) + '</p>' +
        '<p><strong>Periodicidad:</strong> ' + escapeHtml(item.periodicidad) + '</p>' +
        '<p><strong>Cálculo:</strong> ' + escapeHtml(formulaLabel(item.formula)) + '</p>' +
        '<p><strong>Valor:</strong> ' + escapeHtml(fmt(value.value)) + ' ' + escapeHtml(item.unidad || '') + '</p>' +
        '<p><strong>Metodología:</strong> ' + escapeHtml(item.metodologia) + '</p>' +
        '<p><strong>Última actualización:</strong> ' + escapeHtml(item.fecha || 'Sin registrar') + '</p>' +
        '<p><strong>Responsable:</strong> ' + escapeHtml(item.responsable || 'Sin asignar') + '</p>' +
        '<p><strong>Validación:</strong> ' + (item.validado ? 'Revisión interna marcada' : 'Pendiente de validar') + '</p>' +
        '<button type="button" class="pe-btn" style="margin-top:15px" data-pe-sheet="' + escapeHtml(item.id) + '">Exportar ficha CSV</button></article>';
    }).join('');
    empty.hidden = records.length > 0;
  }
  function renderReports() {
    const summary = document.getElementById('peSummary');
    const pending = records.filter(item => status(item).type === 'late');
    const withoutDate = records.filter(item => status(item).type === 'pending');
    const unverified = records.filter(item => !item.validado || !metadataComplete(item));
    summary.innerHTML = [
      [records.length, 'Indicadores registrados'],
      [pending.length, 'Requieren actualización'],
      [withoutDate.length, 'Sin fecha o eventual'],
      [unverified.length, 'Sin validación interna']
    ].map(pair => '<div><strong>' + pair[0] + '</strong><span>' + pair[1] + '</span></div>').join('');
    const warnings = document.getElementById('peWarnings');
    const issues = records.filter(item => status(item).type !== 'good' || !item.validado);
    warnings.innerHTML = issues.map(item => {
      const current = status(item);
      return '<div class="pe-alert"><strong>' + escapeHtml(item.nombre) + '</strong><p>' +
        escapeHtml(current.text + (item.validado ? '' : ' · Validación interna pendiente')) +
        ' · Fuente: ' + escapeHtml(item.fuente) + '</p></div>';
    }).join('');
    document.getElementById('peNoWarnings').hidden = issues.length > 0;
    document.getElementById('peNoReports').hidden = records.length > 0;
  }
  function spreadsheetSafe(value) {
    const text = String(value == null ? '' : value);
    return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
  }
  function csvText(rows, headers) {
    const quote = x => '"' + spreadsheetSafe(x).replace(/"/g, '""') + '"';
    return '\uFEFF' + [headers.map(quote).join(','), ...rows.map(row => row.map(quote).join(','))].join('\r\n');
  }
  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type: type || 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const headers = ['codigo','nombre','sector','variable','fuente','periodicidad','metodologia','formula','numerador','denominador','factor','unidad','fecha','responsable','validado','valor_calculado','estado_actualizacion'];
  function toRow(item) {
    return headers.map(key => {
      if (key === 'valor_calculado') return calculate(item).value == null ? '' : calculate(item).value;
      if (key === 'estado_actualizacion') return status(item).text;
      if (key === 'validado') return item.validado ? 'Sí' : 'No';
      return item[key] == null ? '' : item[key];
    });
  }
  function exportRows(items, prefix) {
    if (!items.length) { notice('No existen indicadores registrados para exportar.'); return; }
    downloadText(prefix + '-' + nowISO() + '.csv', csvText(items.map(toRow), headers));
    notice('Reporte CSV generado con los registros locales. Verifica los datos antes de utilizarlo institucionalmente.');
  }
  function printReport() {
    if (!records.length) { notice('No hay indicadores para generar un reporte.'); return; }
    const lines = records.map(item => '<tr><td>' + escapeHtml(item.nombre) + '</td><td>' +
      escapeHtml(item.sector) + '</td><td>' + escapeHtml(item.fuente) + '</td><td>' +
      escapeHtml(item.periodicidad) + '</td><td>' + escapeHtml(fmt(calculate(item).value) + ' ' + (item.unidad || '')) +
      '</td><td>' + escapeHtml(status(item).text) + '</td><td>' +
      escapeHtml(item.metodologia) + '</td></tr>').join('');
    const child = window.open('', '_blank');
    if (!child) { notice('El navegador bloqueó la ventana para imprimir. Permite ventanas emergentes para generar el PDF.'); return; }
    child.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Plan Estadístico Municipal - reporte local</title>' +
      '<style>body{font:12px Arial;color:#172433;margin:30px}h1{font-size:24px}p{margin:8px 0 24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbc3c9;text-align:left;padding:8px;vertical-align:top}th{background:#edf0f3}@page{size:landscape;margin:12mm}</style></head><body>' +
      '<h1>Plan Estadístico Municipal — reporte de trabajo</h1>' +
      '<p>Generado: ' + nowISO() + ' · DATOS LOCALES NO PUBLICADOS NI CERTIFICADOS. Su uso oficial requiere revisión de las fuentes.</p>' +
      '<table><thead><tr><th>Indicador</th><th>Sector</th><th>Fuente</th><th>Periodicidad</th><th>Valor</th><th>Actualización</th><th>Metodología</th></tr></thead><tbody>' +
      lines + '</tbody></table></body></html>');
    child.document.close();
    child.focus();
    setTimeout(() => child.print(), 280);
    notice('Se abrió la vista de impresión: puedes seleccionar "Guardar como PDF".');
  }
  function parseDelimited(text) {
    const lines = [];
    let row = [], cell = '', quoted = false;
    const first = (text.split(/\r?\n/)[0] || '');
    const delimiter = first.split(';').length > first.split(',').length ? ';' : ',';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (char === '"') quoted = false;
        else cell += char;
      } else if (char === '"') quoted = true;
      else if (char === delimiter) { row.push(cell); cell = ''; }
      else if (char === '\n') {
        row.push(cell.replace(/\r$/, ''));
        if (row.some(x => x.trim())) lines.push(row);
        row = []; cell = '';
      } else cell += char;
    }
    row.push(cell.replace(/\r$/, ''));
    if (row.some(x => x.trim())) lines.push(row);
    if (lines.length < 2) return [];
    const header = lines.shift().map(s => s.trim().replace(/^\uFEFF/, ''));
    return lines.map(values => Object.fromEntries(header.map((key, i) => [key, values[i] || ''])));
  }
  function normalizeDate(raw) {
    if (!raw) return '';
    const input = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
      const parts = input.split('/');
      return parts[2] + '-' + parts[1] + '-' + parts[0];
    }
    const date = Number(input);
    if (Number.isFinite(date) && date > 15000 && date < 80000) {
      return new Date(Date.UTC(1899, 11, 30) + date * 86400000).toISOString().slice(0, 10);
    }
    return '';
  }
  function keyName(key) {
    return String(key).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .trim().replace(/[\s\-]+/g, '_');
  }
  function rowToIndicator(raw) {
    const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [keyName(k), String(v == null ? '' : v).trim()]));
    const get = (...keys) => keys.map(key => values[keyName(key)]).find(Boolean) || '';
    const formula = keyName(get('formula', 'tipo_calculo') || 'valor');
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'importado-' + Date.now() + '-' + Math.random(),
      codigo: get('codigo', 'id'), nombre: get('nombre', 'indicador'),
      sector: get('sector'), variable: get('variable'),
      fuente: get('fuente'), periodicidad: keyName(get('periodicidad')),
      metodologia: get('metodologia', 'metodo'), formula,
      numerador: get('numerador', 'valor_a', 'valor'),
      denominador: get('denominador', 'valor_b'), factor: get('factor') || '1000',
      unidad: get('unidad', 'unidad_de_medida'), fecha: normalizeDate(get('fecha', 'ultima_actualizacion')),
      responsable: get('responsable'), validado: false,
      registrado: new Date().toISOString(), modificado: new Date().toISOString()
    };
    return validRecord(item) ? item : null;
  }
  async function importIndicators(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { notice('El archivo supera el límite de 10 MB.'); return; }
    let rows = [];
    try {
      if (/\.csv$/i.test(file.name)) rows = parseDelimited(await file.text());
      else if (/\.(xlsx|xls)$/i.test(file.name)) {
        if (!window.XLSX) { notice('El lector Excel no está disponible. Puedes exportar el archivo como CSV e intentarlo de nuevo.'); return; }
        const buffer = await file.arrayBuffer();
        const book = window.XLSX.read(buffer, { type: 'array' });
        rows = window.XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '', raw: false });
      } else { notice('Solo se aceptan CSV y Excel (.xlsx, .xls).'); return; }
    } catch (error) { notice('No fue posible leer este archivo. Verifica su formato y contenido.'); return; }
    if (!rows.length) { notice('El archivo no contiene registros para importar.'); return; }
    let rejected = 0, duplicated = 0;
    const parsed = [];
    const existing = new Set(records.map(item => [item.nombre, item.sector, item.fuente].join('|').toLowerCase()));
    for (const row of rows) {
      const item = rowToIndicator(row);
      if (!item) { rejected++; continue; }
      const key = [item.nombre, item.sector, item.fuente].join('|').toLowerCase();
      if (existing.has(key)) { duplicated++; continue; }
      parsed.push(item); existing.add(key);
    }
    if (!parsed.length) {
      notice('Ningún indicador incorporado. Rechazados por datos inválidos: ' + rejected + '; duplicados: ' + duplicated + '. Usa la plantilla para comprobar las columnas.');
      return;
    }
    if (saveRecords([...records, ...parsed])) {
      renderIndicators();
      notice(parsed.length + ' indicadores importados localmente. ' + rejected + ' rechazados y ' + duplicated + ' duplicados omitidos. Pendientes de validación interna.');
    }
  }
  function renderOfficialDocuments() {
    const grid = document.getElementById('peOfficialGrid');
    const empty = document.getElementById('peOfficialEmpty');
    grid.innerHTML = officialDocuments.map(file => {
      const safeUrl = /^https:\/\//i.test(file.url || '') ? file.url : '';
      if (!safeUrl) return '';
      return '<article class="pe-file-card"><small>' + escapeHtml(file.type || 'Documento') +
        (file.verified ? ' · Fuente verificada' : ' · Pendiente de verificar') + '</small>' +
        '<h4>' + escapeHtml(file.title || 'Documento sin título') + '</h4>' +
        '<p>' + escapeHtml(file.description || '') + '</p>' +
        '<p>Fuente: ' + escapeHtml(file.source || 'Por registrar') +
        ' · Fecha: ' + escapeHtml(file.updated || 'Sin registrar') + '</p>' +
        '<a href="' + escapeHtml(safeUrl) + '" target="_blank" rel="noopener noreferrer">Consultar archivo ↗</a></article>';
    }).join('');
    empty.hidden = Boolean(grid.innerHTML);
  }
  async function loadManifest() {
    try {
      const response = await fetch('data/plan-estadistico.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      officialDocuments = Array.isArray(data.documents) ? data.documents : [];
      videoURL = typeof data.videoUrl === 'string' ? data.videoUrl : '';
      renderOfficialDocuments();
    } catch (error) {
      // El repositorio técnico permanece visible con estado vacío sin inventar archivos.
    }
  }
  function openVideo() {
    const dialog = document.getElementById('peVideoDialog');
    const content = document.getElementById('peVideoContent');
    if (/^https:\/\//i.test(videoURL)) {
      if (/\.(mp4|webm)(\?|$)/i.test(videoURL)) {
        const player = document.createElement('video');
        player.controls = true;
        player.playsInline = true;
        player.preload = 'metadata';
        player.poster = 'assets/img/editorial/territorio-aereo.jpg';
        player.style.cssText = 'width:100%;margin-top:16px;max-height:310px';
        player.src = videoURL;
        content.replaceChildren(player);
      } else {
        content.innerHTML = '<p>El video explicativo está publicado en una fuente externa.</p>';
        const link = document.createElement('a');
        link.className = 'pe-btn pe-btn-primary';
        link.href = videoURL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir video ↗';
        content.appendChild(link);
      }
    } else {
      content.innerHTML = '<p>Este espacio está preparado para el video explicativo del Plan Estadístico Municipal. El archivo aún no ha sido aportado ni publicado.</p>' +
        '<p>El plan permite consultar documentos, registrar fuentes e indicadores, revisar su metodología y detectar fechas de actualización pendientes.</p>';
    }
    if (!dialog.open) dialog.showModal();
  }
  function closeVideo() {
    const dialog = document.getElementById('peVideoDialog');
    const player = dialog.querySelector('video');
    if (player) { player.pause(); player.removeAttribute('src'); player.load(); }
    dialog.close();
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-pe-view')) { showView(button.dataset.peView); return; }
    if (button.hasAttribute('data-pe-back')) { showView(''); return; }
    if (button.hasAttribute('data-pe-video')) { openVideo(); return; }
    if (button.hasAttribute('data-pe-close-video')) { closeVideo(); return; }
    if (button.hasAttribute('data-pe-add')) { openForm(null); return; }
    if (button.hasAttribute('data-pe-cancel')) { document.getElementById('peForm').hidden = true; editingId = null; return; }
    if (button.hasAttribute('data-pe-edit')) { showView('indicadores'); openForm(button.dataset.peEdit); return; }
    if (button.hasAttribute('data-pe-delete')) {
      const item = records.find(row => row.id === button.dataset.peDelete);
      if (item && confirm('¿Eliminar el indicador "' + item.nombre + '" del registro local?')) {
        if (saveRecords(records.filter(row => row.id !== item.id))) {
          renderIndicators();
          notice('Indicador eliminado únicamente de este navegador.');
        }
      }
      return;
    }
    if (button.hasAttribute('data-pe-sheet')) {
      const item = records.find(row => row.id === button.dataset.peSheet);
      if (item) exportRows([item], 'ficha-tecnica');
      return;
    }
    if (button.hasAttribute('data-pe-export')) {
      exportRows(records, button.dataset.peExport === 'mipg' ? 'reporte-mipg-local' : 'indicadores-plan-estadistico');
      return;
    }
    if (button.hasAttribute('data-pe-print')) { printReport(); return; }
    if (button.hasAttribute('data-pe-template')) {
      const example = headers.filter(h => !['valor_calculado','estado_actualizacion','validado'].includes(h));
      downloadText('plantilla-plan-estadistico.csv', csvText([], example));
      return;
    }
  });
  document.getElementById('peVideoDialog')?.addEventListener('cancel', event => { event.preventDefault(); closeVideo(); });
  document.getElementById('peVideoDialog')?.addEventListener('click', event => {
    if (event.target.id === 'peVideoDialog') closeVideo();
  });
  document.getElementById('peFormSlot').innerHTML = formHtml();
  document.getElementById('peForm').addEventListener('submit', saveForm);
  document.getElementById('peForm').addEventListener('input', previewFormula);
  document.getElementById('peForm').addEventListener('change', previewFormula);
  document.getElementById('peIndicatorSearch').addEventListener('input', renderIndicators);
  document.getElementById('peIndicatorUpload').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    await importIndicators(file);
    event.target.value = '';
  });
  window.addEventListener('popstate', syncFromHash);
  window.addEventListener('hashchange', syncFromHash);
  loadRecords();
  renderIndicators();
  renderSheets();
  renderReports();
  renderOfficialDocuments();
  loadManifest();
  syncFromHash();
})();
