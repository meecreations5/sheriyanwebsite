import 'server-only';
import {Firestore} from '@google-cloud/firestore';
import {Storage} from '@google-cloud/storage';

// Private server connection. Browsers can never read cms_users directly.
// Firestore server libraries use Google Cloud IAM; they do not use Firebase Auth.
const PROJECT_ID='shanerynwesbite';
const BUCKET='shanerynwesbite.firebasestorage.app';
let firestoreClient,storageClient;

function serverOptions(){
 const raw=process.env.CMS_GOOGLE_CREDENTIALS_JSON||process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
 if(raw){
  let service;
  try{service=JSON.parse(raw)}catch{throw Error('CMS_GOOGLE_CREDENTIALS_JSON contains invalid JSON');}
  if(service.project_id!==PROJECT_ID)throw Error('Server credentials belong to a different Google Cloud project');
  if(!service.client_email||!service.private_key)throw Error('Server credentials are incomplete');
  return {projectId:PROJECT_ID,credentials:{client_email:service.client_email,private_key:String(service.private_key).replace(/\\n/g,'\n')}};
 }
 // ADC may be provided via Google-managed service identity or a local environment.
 // The server must have permission to read/write this project's Firestore.
 return {projectId:PROJECT_ID};
}
export function adminDb(){
 if(!firestoreClient)firestoreClient=new Firestore(serverOptions());
 return firestoreClient;
}
export function adminBucket(){
 if(!storageClient)storageClient=new Storage(serverOptions()).bucket(BUCKET);
 return storageClient;
}
export function plain(value){
 if(value===null||value===undefined)return value??null;
 if(value instanceof Date)return value.toISOString();
 if(typeof value?.toDate==='function')return value.toDate().toISOString();
 if(Array.isArray(value))return value.map(plain);
 if(typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).map(([k,v])=>[k,plain(v)]));
 return value;
}
export function assertOrigin(request){
 const origin=request.headers.get('origin');
 if(!origin)return;
 const here=new URL(request.url);
 const remote=new URL(origin);
 if(remote.host!==here.host||remote.protocol!==here.protocol)throw Object.assign(Error('Invalid request origin'),{status:403});
}
export function json(value,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
