// Public YouTube-link parser. Never embed untrusted arbitrary iframe URLs.
export function getYoutubeVideoId(value){
 const raw=String(value||'').trim();if(!raw)return '';
 if(/^[a-zA-Z0-9_-]{11}$/.test(raw))return raw;
 try{
  const url=new URL(raw);
  if(url.protocol!=='https:')return '';
  const host=url.hostname.toLowerCase();let id='';
  if(['youtu.be','www.youtu.be'].includes(host))id=url.pathname.split('/')[1];
  else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
   id=url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/)?.[1]||'';
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:'';
 }catch{return ''}
}
export function youtubeEmbedUrl(value){const id=getYoutubeVideoId(value);return id?'https://www.youtube-nocookie.com/embed/'+id+'?rel=0':''}
export function isVideoFile(value){return /^(?:https:\/\/[^\s<>]+|assets\/[^\s<>]+|\/[^\s<>]+)\.(?:mp4|webm)(?:\?[^#]*)?$/i.test(String(value||''))}
