'use client';
import {initializeApp,getApps,getApp} from 'firebase/app';
const cfg={
 apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY||'AIzaSyC4Ij3OL2EEVOgUTz_UFY-hxKLPEp4u6Gg',
 authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||'shanerynwesbite.firebaseapp.com',
 projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||'shanerynwesbite',
 storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||'shanerynwesbite.firebasestorage.app',
 messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID||'640296203764',
 appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID||'1:640296203764:web:0076b460e19e068478b5a1',
 measurementId:process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID||'G-GBFEJK9568'
};
export const firebaseApp=getApps().length?getApp():initializeApp(cfg);
