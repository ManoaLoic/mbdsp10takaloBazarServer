const { bucket } = require('../config/firebase');
const { format } = require('util');
const mime = require('mime-types');

const uploadFile = async (fileBase64, fileName) => {
  const buffer = Buffer.from(fileBase64, 'base64');
  const contentType = mime.lookup(fileName) || 'application/octet-stream';

  const file = bucket.file(fileName);

  const stream = file.createWriteStream({
    metadata: {
      contentType: contentType,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('finish', async () => {
      await file.makePublic();
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${file.name}`);
      resolve(publicUrl);
    });

    stream.end(buffer);
  });
};

module.exports = { uploadFile };
