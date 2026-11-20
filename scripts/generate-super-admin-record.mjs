#!/usr/bin/env node
// Only generates the Firestore cms_users document fields for manual creation.
// Never writes to Firestore, stores a plaintext password, or accepts a password on the command line.
import {normalizeUsername,validUsername,passwordHash} from '../lib/cms-password.mjs';

const username=normalizeUsername(process.argv[2]);
if(!validUsername(username)){
 console.error('Usage: node scripts/generate-super-admin-record.mjs <username>');
 console.error('Username must be 3-32 characters, start with a letter, and contain only a-z, 0-9, . _ -');
 process.exit(1);
}
if(!process.stdin.isTTY||typeof process.stdin.setRawMode!=='function'){
 console.error('Run this command interactively in a terminal so the password is not echoed.');
 process.exit(1);
}

function readHidden(label){
 return new Promise((resolve,reject)=>{
  const stdin=process.stdin;
  const raw=Boolean(stdin.isRaw);
  const bytes=[];
  function finish(err,value){
   stdin.off('data',onData);
   stdin.setRawMode(raw);
   stdin.pause();
   process.stdout.write('\n');
   if(err)reject(err);else resolve(value);
  }
  function onData(chunk){
   for(const b of chunk){
    if(b===3){finish(new Error('Cancelled.'));return;}
    if(b===13||b===10){finish(null,Buffer.from(bytes).toString('utf8'));return;}
    if(b===127||b===8){bytes.pop();continue;}
    if(b>=32)bytes.push(b);
   }
  }
  stdin.setRawMode(true);
  stdin.resume();
  stdin.on('data',onData);
  process.stdout.write(label);
 });
}

try{
 const first=await readHidden('New Super Admin password (hidden): ');
 const second=await readHidden('Confirm password (hidden): ');
 if(first!==second)throw new Error('Passwords do not match. No document was generated.');
 const hash=await passwordHash(first); // verifies length 12-128 and uses fresh salt
 console.log('\nIn Firebase Console > Firestore Database > cms_users > Add document:');
 console.log('Document ID: '+username);
 console.log('\nField                Type       Value');
 console.log('username             string     '+username);
 console.log('role                 string     super_admin');
 console.log('active               boolean    true');
 console.log('passwordHash         string     '+hash);
 console.log('sessionVersion       number     1');
 console.log('authMethod           string     cms_users');
 console.log('\nCopy the fields into Firestore. Do not put the password itself in Firestore.');
}catch(error){console.error('Error: '+error.message);process.exitCode=1;}
