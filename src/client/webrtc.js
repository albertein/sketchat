"use strict";

(function() {
  
  var sketchat = window.sketchat;
  var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  var RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
  var RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;

  function WebRTC(media, signaling, errorLogger) {
    this.signaling = signaling;
    this.media = media;
    this.signaling.register('sdp', this.onPeerSDP.bind(this));
    this.signaling.register('peerjoined', this.createOffer.bind(this));
    this.signaling.register('icecandidate', this.onPeerIceCandidate.bind(this));
    this.signaling.register('connectionreset', this.initConnection.bind(this));

    this.signaling.getIce().then(function(ice) {
      this.iceSettings = ice;
      this.initConnection();
    }.bind(this));

    this.errorLogger = errorLogger;
  };

  WebRTC.prototype.onIceCandidate = function onIceCandidate(evt) {
    console.log('Got ice candidate, sending to peer');
    if (evt.candidate) {
      this.signaling.emit('icecandidate', {candidate: evt.candidate});
    }
  };

  WebRTC.prototype.initConnection = function initConnection() {
    if (this.connection) {
      this.connection.close();
    }
    this.connection = new RTCPeerConnection({'iceServers': this.iceSettings});
    this.connection.onaddstream = this.onAddStream.bind(this);
    this.connection.onicecandidate = this.onIceCandidate.bind(this);
    this.media.getStream().then(function(stream) {
      this.connection.addStream(stream);
      this.signaling.join();
    }.bind(this));
  };

  WebRTC.prototype.createOffer = function createOffer() {
    console.log('Creating offer');
    this.connection.createOffer(this.localDescriptionCreated.bind(this), this.errorLogger);
  };

  WebRTC.prototype.onAddStream = function onAddStream(evt) {
    console.log('Got remote stream');
    new sketchat.Player('remotePlayer', evt.stream);
  };

  WebRTC.prototype.localDescriptionCreated = function localDescriptionCreated(description) {
    this.connection.setLocalDescription(description, function () {
      this.signaling.emit('sdp', {
        sdp: this.connection.localDescription
      });
    }.bind(this), this.errorLogger);
  };

  WebRTC.prototype.onPeerIceCandidate = function onPeerIceCandidate(payload) {
    console.log('Got ice candidate')
    this.connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
  };

  WebRTC.prototype.onPeerSDP = function onPeerSDP(payload) {
    this.connection.setRemoteDescription(new RTCSessionDescription(payload.sdp), function () {
      // if we received an offer, we need to answer
      if (this.connection.remoteDescription.type == 'offer') {
        console.log('Got offer, sending answer');
        this.connection.createAnswer(this.localDescriptionCreated.bind(this), this.errorLogger);
      }
    }.bind(this), this.errorLogger);
  };

  window.sketchat.WebRTC = WebRTC;

})();
