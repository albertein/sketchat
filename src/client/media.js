"use strict";

(function() {
  function Media() {
    this.streamPromise = null;
  }

  Media.prototype.getStream = function getStream() {
    if (this.streamPromise) {
      return this.streamPromise;
    }

    var getUserMedia =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
    var mediaConstraints = { video: true, audio: false };

    return this.streamPromise = new Promise(function(resolve, reject) {
      getUserMedia.apply(navigator, [mediaConstraints, resolve, reject]);  
    });
  };

  window.sketchat.Media = Media;

})();
