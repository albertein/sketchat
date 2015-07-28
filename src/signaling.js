var signaling = {
  init: function(io, iceProvider) {
    io.on('connection', onConnection);
    this.iceProvider = iceProvider;
  }
};

// Stores rooms occupancy, every room is represented as an array of it's occupant's sockets
var rooms = {};
var MAX_ROOM_OCCUPANCY = 2;

function onConnection(socket) {

  socket.on('join', function(roomId) {
    var room = rooms[roomId] || [];
    rooms[roomId] = room;
    // We only allow 1-1 calls, so we allow people to join until we reach max occupancy, after that
    // people gets kicked out.
    if (room.length < MAX_ROOM_OCCUPANCY) {
      room.push(socket);
    } else {
      socket.emit('roomfull', 'This room is already full, tough luck');
      return;
    }

    var initiator = room.length == 1; // First user joining is the initiator

    if (!initiator) {
      // Notify to initiator that its peer has just joined
      socket.to(roomId).emit('peerjoined');
    }

    socket.join(roomId);
    socket.room = roomId;
  });

  socket.on('disconnect', function() {
    if (!socket.room) {
      return;
    }
    // When a peer disconects we kick the remaining peer (if any) and ask them to reset the connection
    rooms[socket.room] = [];
    socket.to(socket.room).emit('connectionreset');
  });

  socket.on('icerequest', function() {
    socket.emit('ice', signaling.iceProvider());
  });

  /*
  sdp, icecandidate, draw and chat are all just glorified echo functions, we get a message from a peer and
  we just relay to its peer on the same room
  */


  socket.on('sdp', function(payload) {
    socket.to(socket.room).emit('sdp', payload);
  });

  socket.on('icecandidate', function(payload) {
    socket.to(socket.room).emit('icecandidate', payload);
  });

  socket.on('draw', function(payload) {
    socket.to(socket.room).emit('draw', payload);
  });

  socket.on('chat', function(payload) {
    socket.to(socket.room).emit('chat', payload);
  });

}

module.exports = signaling;
