define("Amp.Manager", ["Amp"], function(){
  Amp.Manager = {
    ZOOM : 100,
    range : 32,
    timeout : 10,
    jsProcessor : 0,
    jsProcessorSize: 4096,
    source : 0,
    bufferSize : 2048,

    init_page: function() {
      this.api = null;
      this.context = null;
      this.currentvalue = new Array();
      this.signal = new Float32Array(this.bufferSize);
      this.initAudio();
      if(this.api != null && this.api.name && this.api.name == "webkit") {
        this.fft = new FFT(this.bufferSize, 44100);
      }
    },

    stop: function() {
      if(this.source != 0) {
        this.stopped = true;
        this.source.noteOff(0);
      }
    },

    initAudio: function() {
      if(typeof webkitAudioContext == "undefined") {
        this.api = Amp.Apis.Mozilla.initialize();
      } else {
        this.api = Amp.Apis.Webkit.initialize();
      }
    },

    audioAvailable : function(event) {
      Amp.Manager.fft.forward(Amp.Manager.signal);
      for ( var i = 0; i < Amp.Manager.bufferSize/Amp.Manager.range; i++ ) {
        Amp.Manager.currentvalue[i] = (Amp.Manager.fft.spectrum[i] * Amp.Manager.ZOOM);
      }
    }
  };
});