
let config = {
  fsRoot: '/Users/baill/git/privat/fileserver/images/',
  rootName: 'Images',
  port: process.env.PORT || '3001',
  host: process.env.HOST || 'localhost'
};

let filemanager = require('@opuscapita/filemanager-server');
filemanager.server.run(config);
