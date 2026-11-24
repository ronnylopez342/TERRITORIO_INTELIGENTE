/* Cabeceras reutilizables solo para la integración solicitada por Subachoque Platform.
   Las fotos de Caracterización se usan como referencia provisional; cada pestaña
   tiene configuración propia y nunca modifica los originales ni sus encuadres. */
(() => {
  'use strict';
  const params=new URLSearchParams(location.search);
  if(params.get('embed')!=='data'||params.get('skin')!=='practica-pais'||params.get('headers')!=='20261124-v1')return;
  if(!document.documentElement.classList.contains('ti-practica-embed'))return;
  const originals='https://nlhbedssakkafrvvbqyt.supabase.co/storage/v1/object/public/practica-pais-cabecera/caracterizacion/foto-';
  const photo=(n)=>({url:originals+String(n).padStart(2,'0'),position:'50% 50%'});
  const photos=(...numbers)=>numbers.map(photo);
  // Independent configurations: titles, descriptions, image URLs and framing.
  const sections={
    'data-subachoque':{
      title:'Data Subachoque',
      lead:'Consulta los <strong>indicadores del municipio</strong> organizados por dimensiones, áreas y categorías, a partir de las fichas y registros documentados del territorio.',
      images:photos(1,2,3,4,5,6,7)
    },
    'data-encuesta':{
      title:'Vivienda',
      lead:'Conoce las <strong>condiciones habitacionales</strong> del municipio y el proceso de visitas técnicas, evaluación y priorización de las viviendas.',
      images:photos(1,2,3,4,5,6,7)
    },
    'data-explorando':{
      title:'Recursos',
      lead:'Un espacio para consultar los <strong>materiales y recursos</strong> relacionados con el trabajo de caracterización y conocimiento del territorio.',
      images:photos(1,2,3,4,5,6,7)
    }
  };
  document.documentElement.classList.add('pp-tab-heroes');
  function mount(){
    for(const [id,config] of Object.entries(sections)){
      const panel=document.getElementById(id);
      if(!panel||panel.querySelector(':scope > .pp-tab-hero'))continue;
      const hero=document.createElement('header');
      hero.className='pp-tab-hero pp-char-header';
      hero.dataset.section=id;
      hero.setAttribute('aria-labelledby','pp-tab-title-'+id);
      hero.innerHTML='<div class="pp-char-copy"><p class="pp-char-eyebrow">SUBACHOQUE PLATFORM</p><h1 id="pp-tab-title-'+id+'">'+config.title+'</h1><span class="pp-char-rule" aria-hidden="true"></span><p class="pp-char-lead">'+config.lead+'</p></div><div class="pp-char-photos" aria-label="Fotografías del trabajo de campo"></div>';
      const grid=hero.querySelector('.pp-char-photos');
      config.images.forEach((item,i)=>{
        const tile=document.createElement('div');
        tile.className='pp-char-photo pp-char-photo--ready';
        tile.dataset.photoSlot=String(i+1);
        const img=document.createElement('img');
        img.alt='Registro fotográfico del trabajo de campo';
        img.decoding='async';img.loading='lazy';
        const [x,y]=item.position.split(' ');
        tile.style.setProperty('--pp-object-x',x);tile.style.setProperty('--pp-object-y',y);
        img.src=item.url;
        tile.append(img);grid.append(tile);
      });
      panel.prepend(hero);
    }
    // The existing observer measures the real active panel, including its header.
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
