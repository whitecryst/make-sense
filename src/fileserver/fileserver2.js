const fs = require('fs');
const path = require('path');
const compression = require('compression');
const express = require('express');
const filemanagerMiddleware = require('@opuscapita/filemanager-server').middleware;
const logger = require('@opuscapita/filemanager-server').logger;
const env = require('./.env');

const config = {
  fsRoot: path.resolve('/var/www/html/fileserver/images/'),
  rootName: 'Images'
};

const app = express();
const host = process.env.HOST || 'kungfu-wiki.com';
const port = process.env.PORT || '3001';

fs.writeFileSync(
  path.resolve(__dirname, './static/env.js'),
  'window.env = ' + JSON.stringify(env) + ';'
);

app.use(compression());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.header.origin);
  next();
});

// authentication
const cors = require('cors');
app.use(cors());
const basicAuth = require('express-basic-auth');
app.use(basicAuth({
    users: { 'kungfu': 'V2KeedPRaqQ8' },
    challenge: false // <--- needed to actually show the login dialog!
}));

const baseUrl = process.env.BASE_URL || '/';

app.use(baseUrl, filemanagerMiddleware(config));

app.use(baseUrl, express.static(path.resolve(__dirname, './static')));

const https = require('https');
var key = fs.readFileSync( '/etc/letsencrypt/live/kungfu-wiki.com/privkey.pem');
var cert = fs.readFileSync( '/etc/letsencrypt/live/kungfu-wiki.com/cert.pem');
var options = {
  key: key,
  cert: cert
};
var server = https.createServer(options, app);
server.listen(port, host, function(err) {

  app.listen(port, host, function(err) {
  if (err) {
    logger.error(err);
  }

  logger.info(`Server listening at https://${host}:${port}`);
});

process.on('exit', function() {
  logger.warn('Server has been stopped');
});
