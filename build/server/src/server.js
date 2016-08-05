var compression, config, express, server;

config = require('./config').config;

express = require('express');

compression = require('compression');

server = express();

server.use(compression());

server.use(express["static"]('./build/served/'));

server.get('*', function(req, res) {
  return res.sendfile('./build/served/error.html', 404);
});

server.listen(config.webServer.port);
