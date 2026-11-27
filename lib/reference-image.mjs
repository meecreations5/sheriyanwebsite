// Private customer inspiration image policy. Only image bytes are accepted.
export const MAX_REFERENCE_BYTES=3*1024*1024;
const signatures={
 'image/jpeg':b=>b.length>=4&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff,
 'image/png':b=>b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
 'image/webp':b=>b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'
};
export function validateReferenceImage(file,bytes){
 if(!file||!bytes?.length)return null;
 if(bytes.length>MAX_REFERENCE_BYTES)throw Object.assign(Error('Reference image must be 3 MB or smaller'),{status:413});
 const mime=String(file.type||'').toLowerCase();
 if(!signatures[mime]?.(bytes))throw Object.assign(Error('Upload a valid JPG, PNG or WebP image'),{status:415});
 const extension=mime==='image/jpeg'?'jpg':mime==='image/png'?'png':'webp';
 return {contentType:mime,extension,size:bytes.length,name:String(file.name||'reference-image').replace(/[^a-zA-Z0-9._ -]/g,'').slice(0,100)};
}
export function needsBespokePhone(input){
 const source=String(input?.source||'').split('?')[0].toLowerCase();
 const f=input?.fields||{};
 return source==='/bespoke'||/bespoke/i.test(String(input?.source||''))||/bespoke/i.test(String(f.service||f.interest||''))||f.formType==='bespoke-measurements';
}
export function validCustomerPhone(phone){const s=String(phone||'').trim();return /^[+()0-9. -]{7,35}$/.test(s)&&s.replace(/\D/g,'').length>=7&&s.replace(/\D/g,'').length<=15;}
