"use strict";

(function() {
  var sketchat = window.sketchat = {};
  var socket;

  function init() {
    var room = document.location.hash;
    if (!room) {
      room = Math.floor(Math.random() * 10000);
      document.location.hash = room;
    } else {
      room = room.substring(1); // Remove # from the room id
    }
    var signaling = new sketchat.Signaling(room);
    var media = new sketchat.Media();
    var webrtc = new sketchat.WebRTC(media, signaling, onError);
    var painter = new sketchat.Painter('canvas', signaling);
    var chat = new sketchat.Chat('chat-container', 'chat-input', signaling);

    media.getStream().then(onVideoInit).catch(onError);
  }

  function onVideoInit(mediaStream) {
    new sketchat.Player('localPlayer', mediaStream);
  }

  function onError() {
    console.log(arguments);
    alert('Whoops, something went wrong, check the console for details');
  }

  document.addEventListener('DOMContentLoaded', init);

})();
