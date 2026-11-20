'use client';
import {isSupported,getAnalytics,logEvent} from 'firebase/analytics';
import {firebaseApp} from '@/lib/firebase-client';
let promise;
export async function analytics(){if(!promise)promise=isSupported().then(ok=>ok?getAnalytics(firebaseApp):null).catch(()=>null);return promise}
export async function recordEvent(name,params={}){const a=await analytics();if(a)logEvent(a,name,params)}
