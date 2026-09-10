/* ===================================================================
   TERRITORIO INTELIGENTE - SUBACHOQUE
   JavaScript compartido: menú responsive, acordeones y carrusel
   =================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Menú hamburguesa (móvil) ---------- */
  var btn  = document.querySelector('.hamburguesa');
  var menu = document.querySelector('.menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      menu.classList.toggle('abierto');
    });
  }

  /* ---------- Acordeones (Data Territorio / Unidad de Cumplimiento) ---------- */
  var cabezas = document.querySelectorAll('.acordeon .cabeza');
  cabezas.forEach(function (cab) {
    cab.addEventListener('click', function () {
      var padre = cab.closest('.acordeon');
      padre.classList.toggle('abierto');
      var flecha = cab.querySelector('.flecha');
      if (flecha) flecha.textContent = padre.classList.contains('abierto') ? '−' : '+';
    });
  });

  /* ---------- Carrusel de noticias (HOME) ---------- */
  var carrusel = document.querySelector('.carrusel');
  if (carrusel) {
    var slides  = carrusel.querySelectorAll('.slide');
    var puntos  = carrusel.querySelectorAll('.punto');
    var actual  = 0;

    function mostrar(i) {
      slides.forEach(function (s, idx) { s.classList.toggle('activo', idx === i); });
      puntos.forEach(function (p, idx) { p.classList.toggle('activo', idx === i); });
      actual = i;
    }

    puntos.forEach(function (p, idx) {
      p.addEventListener('click', function () { mostrar(idx); });
    });

    /* Flechas anterior / siguiente */
    var flechaIzq = carrusel.querySelector('.flecha-carr.izq');
    var flechaDer = carrusel.querySelector('.flecha-carr.der');
    if (flechaIzq) flechaIzq.addEventListener('click', function () { mostrar((actual - 1 + slides.length) % slides.length); });
    if (flechaDer) flechaDer.addEventListener('click', function () { mostrar((actual + 1) % slides.length); });

    if (slides.length > 1) {
      setInterval(function () {
        mostrar((actual + 1) % slides.length);
      }, 6000);
    }
  }

});

/* ---------- Widget de accesibilidad: cambiar tamaño de texto ---------- */
var nivelTexto = 0;
function cambiarTexto(dir) {
  nivelTexto = Math.max(-1, Math.min(3, nivelTexto + dir));
  document.documentElement.style.fontSize = (100 + nivelTexto * 10) + '%';
}
