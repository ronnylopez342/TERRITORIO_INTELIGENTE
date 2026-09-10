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

    if (slides.length > 1) {
      setInterval(function () {
        mostrar((actual + 1) % slides.length);
      }, 5000);
    }
  }

});
