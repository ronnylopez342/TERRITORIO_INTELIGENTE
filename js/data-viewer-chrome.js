'use strict';
/*
 * Accessible chapter navigation for the immersive 2.2 visor.
 * The reference document is deliberately unchanged: its images and interactive
 * chapter hotspots remain intact. This script only restyles its same-origin UI.
 */
(() => {
  const viewer=document.querySelector('#data-fuentes .sources-reference-frame');
  if(!viewer)return;
  function decorate(){
    let doc;
    try{doc=viewer.contentDocument;}catch{return;}
    if(!doc || !doc.head || !doc.body)return;
    const toggle=doc.getElementById('tiRefToggle');
    const sidebar=doc.getElementById('tiRefSidebar');
    if(!toggle || !sidebar || doc.getElementById('tiE2ChapterChrome'))return;
    const styles=doc.createElement('style');
    styles.id='tiE2ChapterChrome';
    styles.textContent=`
      :root{--ti-sidebar:245px}
      .ti-ref-sidebar{
        background:#151e27!important;
        color:#f7f5ee!important;
        padding-top:70px!important;
        border-right:1px solid #38444c!important;
      }
      .ti-ref-sidebar h2{font:800 20px/1.15 Inter,system-ui,Arial,sans-serif!important;letter-spacing:-.035em!important}
      .ti-ref-chapter{border-radius:0!important}
      .ti-ref-chapter.active{background:#ffe500!important;color:#131e27!important}
      .ti-ref-chapter.active .node{background:#131e27!important}
      .ti-ref-chapter.active .ti-ref-copy b{color:#131e27!important}
      .ti-ref-chapter:not(.active):hover{background:#2c3a45!important}
      #tiRefToggle{
        display:flex!important;align-items:center!important;justify-content:center!important;
        position:fixed!important;
        top:14px!important;left:14px!important;right:auto!important;
        z-index:65!important;
        width:44px!important;height:42px!important;min-width:44px!important;
        margin:0!important;padding:0!important;
        border:2px solid #151e27!important;border-radius:0!important;
        background:#ffe500!important;box-shadow:0 5px 14px #11182033!important;
        color:transparent!important;font-size:0!important;
      }
      #tiRefToggle:before{
        content:"";display:block;width:21px;height:18px;flex:0 0 21px;
        background:linear-gradient(to bottom,
          #131e27 0 2px,transparent 2px 8px,
          #131e27 8px 10px,transparent 10px 16px,
          #131e27 16px 18px)!important;
      }
      #tiRefToggle:hover,#tiRefToggle:focus-visible{background:#fff!important;outline:2px solid #151e27!important;outline-offset:2px!important}
      @media(max-width:900px){
        .ti-ref-sidebar{
          position:fixed!important;left:0!important;top:0!important;bottom:0!important;
          display:block!important;
          width:min(286px,85vw)!important;height:100dvh!important;
          padding:70px 12px 20px!important;overflow-y:auto!important;overflow-x:hidden!important;
          transition:transform .24s ease!important;
          z-index:55!important;
        }
        .ti-ref-sidebar h2{display:block!important}
        .ti-ref-list{display:grid!important;gap:0!important;min-width:0!important;padding-bottom:20px!important}
        .ti-ref-chapter{max-width:100%!important;min-width:0!important;width:100%!important;display:grid!important;grid-template-columns:36px 1fr!important}
        .ti-ref-main{margin-left:0!important}
        body.sidebar-hidden .ti-ref-sidebar{transform:translateX(-110%)!important}
        #tiRefToggle{display:flex!important;left:12px!important;top:12px!important}
      }
    `;
    doc.head.appendChild(styles);
    if(doc.defaultView?.innerWidth<=900)doc.body.classList.add('sidebar-hidden');
    function status(){
      const hidden=doc.body.classList.contains('sidebar-hidden');
      toggle.setAttribute('aria-label',hidden?'Mostrar capítulos del territorio':'Ocultar capítulos del territorio');
      toggle.setAttribute('aria-expanded',String(!hidden));
      toggle.setAttribute('aria-controls','tiRefSidebar');
      toggle.setAttribute('title',hidden?'Mostrar capítulos':'Ocultar capítulos');
    }
    toggle.addEventListener('click',()=>requestAnimationFrame(status));
    sidebar.querySelectorAll('.ti-ref-chapter').forEach(button=>{
      button.addEventListener('click',()=>{
        if(doc.defaultView.innerWidth<=900){
          doc.body.classList.add('sidebar-hidden');
          status();
        }
      });
    });
    doc.defaultView?.addEventListener('resize',()=>{
      if(doc.defaultView.innerWidth<=900)doc.body.classList.add('sidebar-hidden');
      status();
    });
    status();
  }
  viewer.addEventListener('load',decorate);
  try{if(viewer.contentDocument?.readyState==='complete')decorate();}catch{}
})();
