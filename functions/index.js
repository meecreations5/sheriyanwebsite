const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {initializeApp, getApps} = require('firebase-admin/app');
const {getAuth} = require('firebase-admin/auth');
const {getFirestore} = require('firebase-admin/firestore');
const {createResetStaffPasswordHandler} = require('./reset-staff-password');

if (getApps().length === 0) initializeApp();

exports.resetStaffPassword = onCall(
  {region: 'asia-south1', maxInstances: 5, timeoutSeconds: 30},
  createResetStaffPasswordHandler({db: getFirestore(), auth: getAuth(), HttpsError})
);
