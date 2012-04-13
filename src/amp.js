(function (global) {
  // Shamelessly following Backbone's lead
  var root = this;
  var Amp = null;
  Amp = (typeof exports !== 'undefined')? exports : root.Amp = {};
  var $ = root.jQuery;

  // Histogram visualization based off of:
  // http://www.storiesinflight.com/jsfft/visualizer/index.html

  var bufferSize = 2048;
  var signal = new Float32Array(bufferSize);

  var modules = {};

  Amp.define = function(module, dependencies, fn) {
    if (typeof define === 'function' && define.amd) {
      define(module, dependencies, fn);
    } else {
      if (dependencies && dependencies.length) {
        for (var i = 0; i < dependencies.length; i++) {
          dependencies[i] = modules[dependencies[i]];
        }
      }
      modules[module] = fn.apply(this, dependencies || []);
    }
  };

  if (typeof define === 'undefined') {
    global.define = Amp.define;
  }

  Amp.Manager = {
    ZOOM : 100,
    range : 32,
    timeout : 10,
    jsProcessor : 0,
    source : 0,

    init_page: function() {
      this.api = null;
      this.context = null;
      this.currentvalue = new Array();
      this.initAudio();
      if(this.api != null && this.api == "webkit") {
        this.fft = new FFT(bufferSize, 44100);
      }
    },

    // Mozilla API needs to wait for a different callback to properly set up FFT
    init_moz_page: function() {
      var framebufferlength = Amp.Manager.context.mozFrameBufferLength;
      var channels = Amp.Manager.context.mozChannels;
      var samplerate = Amp.Manager.context.mozSampleRate;
      Amp.Manager.fft = new FFT(framebufferlength, samplerate);
    },

    loadSample: function(url) {
      var request = Amp.Request.initialize({url: url});
      request.send();
    },

    stop: function() {
      if(this.source != 0) {
        this.stopped = true;
        this.source.noteOff(0);
      }
    },

    initAudio: function() {
      // TODO Debug for firefox
      if(typeof webkitAudioContext == "undefined") {
        this.api = "mozilla";
        Amp.Manager.context = new Audio();
        Amp.Manager.context.src = "/images/milkshake.ogg";
        Amp.Manager.context.addEventListener('MozAudioAvailable', this.audioAvailable, false);
        Amp.Manager.context.addEventListener('loadedmetadata', this.init_moz_page, false);
        Amp.Manager.context.play();
        Amp.Visualizer.animate();
      } else {
        this.api = "webkit";
        this.context = new webkitAudioContext();
        this.context.sampleRate = 44100;
        Amp.Manager.source = this.context.createBufferSource();

        this.jsProcessor = this.context.createJavaScriptNode(4096, 1, 2);
        this.jsProcessor.onaudioprocess = this.audioAvailable.bind(this);

        Amp.Manager.source.connect(this.jsProcessor);
        this.jsProcessor.connect(this.context.destination);
        this.loadSample(this.url);
      }
    },

    // TODO Make seperate classes for seperate APIs
    audioAvailable : function(event) {
      if(this.api != null && this.api == "webkit") {
        var inputArrayL = event.inputBuffer.getChannelData(0);
        var inputArrayR = event.inputBuffer.getChannelData(1);
        var outputArrayL = event.outputBuffer.getChannelData(0);
        var outputArrayR = event.outputBuffer.getChannelData(1);

        var n = inputArrayL.length;

        for (var i = 0; i < n; i++) {
          outputArrayL[i] = inputArrayL[i];
          outputArrayR[i] = inputArrayR[i];
          signal[i] = (inputArrayL[i] + inputArrayR[i]) / 2;
        }
      } else if (Amp.Manager.api != null && Amp.Manager.api == "mozilla") {
        var framebuffer = event.frameBuffer;
        var time = event.time;
        var magnitude = null;
        var framebufferlength = Amp.Manager.context.mozFrameBufferLength;

        for(var i = 0, fbl = framebufferlength/2; i < fbl; i++) {
          signal[i] = (framebuffer[2*i] + framebuffer[2*i+1]) / 2;
        }
      }

      Amp.Manager.fft.forward(signal);

      for ( var i = 0; i < bufferSize/Amp.Manager.range; i++ ) {
        Amp.Manager.currentvalue[i] = (Amp.Manager.fft.spectrum[i] * Amp.Manager.ZOOM);
      }
    }
  };

})(typeof window === 'undefined' ? this : window);