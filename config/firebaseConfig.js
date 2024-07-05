const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-firebase-project-id.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = { bucket };
