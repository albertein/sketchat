var signaling = {
  init: function(io, iceProvider) {
    io.on('connection', onConnection);
    this.iceProvider = iceProvider;
  }
};

var rooms = {}; // Stores rooms occupancy 

function onConnection(socket) {

  socket.on('iceRequest', function() {
    socket.emit('ice', signaling.iceProvider());
  });

  socket.on('join', function(roomId) {
    var occupancy = rooms[roomId];
    var initiator = false;
    if (!occupancy) {
      rooms[roomId] = 1;
      initiator = true;
    } else if (occupancy == 1) {
      rooms[roomId] = 2;
    } else {
      socket.emit('full');
      return;
    }

    if (!initiator) {
      socket.to(roomId).emit('peerjoined');
    }
    socket.join(roomId);
    socket.mainRoom = roomId;
  });

  socket.on('disconnect', function() {
    if (socket.mainRoom) {
      rooms[socket.mainRoom] = 0;
      socket.to(socket.mainRoom).emit('peerdisconnected');
    }
  });

  socket.on('sdp', function(payload) {
    socket.to(socket.rooms[1]).emit('sdp', payload);
  });

  socket.on('icecandidate', function(payload) {
    socket.to(socket.mainRoom).emit('icecandidate', payload);
  });

  socket.on('draw', function(payload) {
    socket.to(socket.mainRoom).emit('draw', payload);
  });

  socket.on('chat', function(payload) {
    socket.to(socket.mainRoom).emit('chat', payload);
  });

}

module.exports = signaling;
