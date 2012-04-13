define("Amp.Visualizer", ["Amp"], function(){
  Amp.Visualizer = {
    canvas : document.getElementById('fft'),
    color : '#EEEEEE',
    bar_width : 50,
    bar_gap : 50,

    animate: function() {
      this.bar_height = this.canvas.height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = this.color;
      for (var i=0; i<Amp.Manager.currentvalue.length; i++) {
        this.ctx.fillRect(i * this.bar_gap, this.bar_height, this.bar_width, -Amp.Manager.currentvalue[i]*3);
      }

      t = setTimeout('Amp.Visualizer.animate()', Amp.Manager.timeout);
      if(this.stopped) {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        clearTimeout(t);
      }
    }
  };
});