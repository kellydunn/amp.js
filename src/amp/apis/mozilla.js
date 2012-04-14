define("Amp.Apis.Mozilla", ["Amp", "Amp.Apis"], function(){
  Amp.Apis.Mozilla = {
    initialize : function (){
      this.name = "mozilla";
      this.context = new Audio();
      this.context.src = Amp.Manager.ogg;
      this.context.addEventListener('MozAudioAvailable', this.audioAvailable.bind(this), false);
      this.context.addEventListener('loadedmetadata', this.loadedMetadata.bind(this), false);
      this.context.play();
      Amp.Visualizer.animate();
      return this;
    },

    // TODO need to find out how to bind moz callbacks to use native "this"
    audioAvailable: function(event) {
      var framebuffer = event.frameBuffer;
      var time = event.time;
      var magnitude = null;
      var framebufferlength = Amp.Manager.api.context.mozFrameBufferLength;

      for(var i = 0, fbl = framebufferlength/2; i < fbl; i++) {
        Amp.Manager.signal[i] = (framebuffer[2*i] + framebuffer[2*i+1]) / 2;
      }

      Amp.Manager.audioAvailable(event);
    },

    // TODO need to find out how to bind moz callbacks to use native "this"
    loadedMetadata: function(event) {
      var framebufferlength = Amp.Manager.api.context.mozFrameBufferLength;
      var channels = Amp.Manager.api.context.mozChannels;
      var samplerate = Amp.Manager.api.context.mozSampleRate;
      Amp.Manager.fft = new FFT(framebufferlength, samplerate);
    }
  };
});