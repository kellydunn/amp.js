(function (global) {
  // Shamelessly following Backbone's lead
  var root = this;
  var Amp = null;
  Amp = (typeof exports !== 'undefined')? exports : root.Amp = {};
  var $ = root.jQuery;

  // Histogram visualization based off of:
  // http://www.storiesinflight.com/jsfft/visualizer/index.html
  var currentvalue = new Array();

  var bufferSize = 2048;
  var signal = new Float32Array(bufferSize);
  var peak = new Float32Array(bufferSize);

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
      this.initAudio();
      if(this.api != null && this.api == "webkit") {
        this.fft = new FFT(bufferSize, 44100);
      }
    },

    // Mozilla API needs to wait for a different callback to properly set up FFT
    init_moz_page: function() {
      var framebufferlength = this.context.mozFrameBufferLength;
      var channels = this.context.mozChannels;
      var samplerate = this.context.mozSampleRate;
      this.fft = new FFT(framebufferlength, samplerate);
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
        this.context = new Audio();
        this.context.src = "/images/milkshake.ogg";
        this.context.addEventListener('MozAudioAvailable', this.audioAvailable, false);
        this.context.addEventListener('loadedmetadata', this.init_moz_page, false);
        this.context.play();
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
        var framebufferlength = this.context.mozFrameBufferLength;

        for(var i = 0, fbl = framebufferlength/2; i < fbl; i++) {
          signal[i] = (framebuffer[2*i] + framebuffer[2*i+1]) / 2;
        }
      }

      this.fft.forward(signal);

      for ( var i = 0; i < bufferSize/Amp.Manager.range; i++ ) {
        currentvalue[i] = (this.fft.spectrum[i] * Amp.Manager.ZOOM);
      }
    }
  };

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
      for (var i=0; i<currentvalue.length; i++) {
        this.ctx.fillRect(i * this.bar_gap, this.bar_height, this.bar_width, -currentvalue[i]*3);
      }

      t = setTimeout('Amp.Visualizer.animate()', Amp.Manager.timeout);
      if(this.stopped) {
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        clearTimeout(t);
      }
    }
  };
})(typeof window === 'undefined' ? this : window);