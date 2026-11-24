// Keep the public Bespoke page available if a CMS read or one optional gallery
// enhancement fails. All exceptions still appear in Vercel's server logs.
function reportBespokeError(stage,error){
 console.error(`[SHANERYN][BESPOKE_${stage}]`,error?.stack||error?.message||error);
}
export async function withBespokeReadFallback(slug,read,fallback){
 try{return await read()}
 catch(error){
  if(slug!=='bespoke')throw error;
  reportBespokeError('CMS_READ',error);
  return fallback();
 }
}
export function withBespokeRenderFallback(slug,render,fallback){
 try{return render()}
 catch(error){
  if(slug!=='bespoke')throw error;
  reportBespokeError('RENDER',error);
  return fallback();
 }
}
