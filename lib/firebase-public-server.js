// Public, rules-protected Firestore reads from Next.js. No privileged Admin SDK.
// Content documents are public; enquiries and admin users are never read here.
import 'server-only';
import {initializeApp,getApp,getApps} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
const name='shaneryn-public-server';
const options={
 apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY||'AIzaSyC4Ij3OL2EEVOgUTz_UFY-hxKLPEp4u6Gg',
 authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||'shanerynwesbite.firebaseapp.com',
 projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||'shanerynwesbite',
 appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID||'1:640296203764:web:0076b460e19e068478b5a1'
};
const app=getApps().some(a=>a.name===name)?getApp(name):initializeApp(options,name);
export const publicCmsDb=getFirestore(app);
