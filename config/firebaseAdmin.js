const admin = require('firebase-admin');
const serviceAccount = require('../xavia-3ee10-firebase-adminsdk-paeyn-67f6b398f6.json'); // Đường dẫn tới tệp service account JSON bạn cung cấp

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
