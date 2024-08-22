
var admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = require('./TokkenFirebase/takalobazaar-firebase-adminsdk-jotd6-8d58179b73.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  },'takaloBazaarFirebase');

  console.log('Firebase a été initialisé');
}

module.exports = admin;
