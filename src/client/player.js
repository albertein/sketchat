"use strict";

(function() {
  window.sketchat.Player = function Player(playerId, stream) {
    document.getElementById(playerId).src = window.URL.createObjectURL(stream);
  }
})();
