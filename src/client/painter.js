"use strict";

(function(){
  function Painter(idCanvas, signaling) {
    this.canvas = document.getElementById(idCanvas);
    this.signaling = signaling;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.addEventListener('mousedown', this.onStartDraw.bind(this));
    this.canvas.addEventListener('mousemove', this.onDraw.bind(this));
    this.canvas.addEventListener('mouseup', this.onEndDraw.bind(this));

    this.signaling.register('draw', this.drawSegment.bind(this));
    this.signaling.register('connectionreset', this.clear.bind(this));
  }

  Painter.prototype.clear = function clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Painter.prototype.pointFromEvent = function pointFromEvent(evt) {
    return {
      x: evt.offsetX,
      y: evt.offsetY
    };
  };

  Painter.prototype.onStartDraw = function(evt) {
    this.currentSegment = {
      start: this.pointFromEvent(evt),
      end: {}
    };
  };

  Painter.prototype.onDraw = function(evt) {
    if (!this.currentSegment) {
      return;
    }
    this.currentSegment.end = this.pointFromEvent(evt);
    this.signaling.emit('draw', this.currentSegment);
    this.drawSegment(this.currentSegment);
    this.currentSegment = {
      start: this.currentSegment.end,
      end: null
    };
  };

  Painter.prototype.onEndDraw = function(evt) {
    this.currentSegment.end = this.pointFromEvent(evt);
    this.signaling.emit('draw', this.currentSegment);
    this.drawSegment(this.currentSegment);
    this.currentSegment = null;
  };


  Painter.prototype.drawSegment = function(segment) {
    this.ctx.beginPath();
    this.ctx.moveTo(segment.start.x, segment.start.y);
    this.ctx.lineTo(segment.end.x, segment.end.y);
    this.ctx.stroke();
    this.ctx.closePath();
  };

  window.sketchat.Painter = Painter;

})();
