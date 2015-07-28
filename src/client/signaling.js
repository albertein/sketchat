"use strict";

(function() {

  function Signaling(room) {
    this.room = room;
    this.socket = io.connect();
    this.connectPromise = new Promise(function(resolve, reject) {
      this.socket.on('connect', resolve);
    }.bind(this));
    this.initIce();
  };

  Signaling.prototype.join = function() {
    this.emit('join', this.room);
  }

  Signaling.prototype.initIce = function initIce() {
    this.icePromise = new Promise(function(resolve, reject) {
      this.socket.on('ice', resolve);
    }.bind(this));
    this.connectPromise.then(function() {
      this.socket.emit('icerequest')
    }.bind(this));
  };

  Signaling.prototype.getIce = function getIce() {
    return this.icePromise;
  }

  Signaling.prototype.register = function register(evt, callback) {
    this.connectPromise.then(function() {
      this.socket.on(evt, callback);
    }.bind(this));
  };

  Signaling.prototype.emit = function emit(evt, payload) {
    this.connectPromise.then(function() {
      this.socket.emit(evt, payload);
    }.bind(this));
  };

  window.sketchat.Signaling = Signaling;

})();
