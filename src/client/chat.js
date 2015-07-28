"use strict";

(function() {

  function Chat(chatContainerId, inputId, singaling) {
    this.singaling = singaling;
    this.container = document.getElementById(chatContainerId);
    this.input = document.getElementById(inputId);
    this.input.addEventListener('keypress', function(evt) {
      if (evt.keyCode === 13) {
        this.onInput();
      }
    }.bind(this));
    this.singaling.register('chat', this.addMessage.bind(this));
    this.singaling.register('connectionreset', this.clear.bind(this));
  }

  Chat.prototype.clear = function clear() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  };

  Chat.prototype.onInput = function onInput() {
    this.addMessage(this.input.value);
    this.singaling.emit('chat', this.input.value);
    this.input.value = '';
  };

  Chat.prototype.addMessage = function addMessage(message) {
    var entry = document.createElement("P");
    entry.innerText = message;
    if (this.container.firstChild) {
      this.container.insertBefore(entry, this.container.firstChild);
    } else {
      this.container.appendChild(entry);
    }
  };

  window.sketchat.Chat = Chat;
})();
