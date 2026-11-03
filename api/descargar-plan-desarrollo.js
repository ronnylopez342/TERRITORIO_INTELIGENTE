/* Descarga del documento original de la Alcaldia, sin editar ni reconstruir el PDF. */
const original="https://subachoquecundinamarca.micolombiadigital.gov.co/sites/subachoquecundinamarca/content/files/000996/49772_acuerdo-n4-del-23-abril-de-2024_compressed.pdf";
export default async function handler(req,res){
  if(req.method!=="GET" && req.method!=="HEAD"){
    res.setHeader("Allow","GET, HEAD");
    return res.status(405).end("Metodo no permitido");
  }
  try{
    const response=await fetch(original,{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error("Documento remoto no disponible");
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length<1000 || bytes.subarray(0,4).toString("ascii")!=="%PDF")throw new Error("Respuesta no es un PDF");
    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition",'attachment; filename="Plan-de-Desarrollo-Subachoque-2024-2028.pdf"');
    res.setHeader("Cache-Control","public, max-age=3600, s-maxage=86400");
    res.setHeader("Content-Length",String(bytes.length));
    if(req.method==="HEAD")return res.status(200).end();
    return res.status(200).end(bytes);
  }catch(error){
    // Se conserva acceso al documento oficial incluso ante fallas del proxy.
    return res.redirect(302,original);
  }
}
