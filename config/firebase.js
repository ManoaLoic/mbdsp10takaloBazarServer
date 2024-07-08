const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');

const serviceAccount = require('./serviceAccountKey.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'takalobazaar.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = { bucket };