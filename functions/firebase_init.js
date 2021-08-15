const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = admin.initializeApp(functions.config().firebase);
module.exports = {app}