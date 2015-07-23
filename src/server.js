var http = require('http');
var express = require('express');
var freeice = require('freeice');
var app = express();
var io;
var server;
var signaling = require('./signaling.js');

function init() {
  app.use(express.static('client'));
  
  server = app.listen(8080, function() {
    console.log('Listening on port 8080');
  });

  io = require('socket.io')(server);
  signaling.init(io, freeice);
}

init();
