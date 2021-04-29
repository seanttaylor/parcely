const functions = require('firebase-functions');
const app = require('./app.index');

exports.parcely = functions.https.onRequest(app);
