(function (global) {
  var root = this;
  var Amp = null;
  Amp = (typeof exports !== 'undefined')? exports : root.Amp = {};
  var $ = root.jQuery;
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

})(typeof window === 'undefined' ? this : window);
define("Amp.Apis", ["Amp"], function(){
  Amp.Apis = {};
});
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
      if(this.api != null && this.api == "webkit") {
        this.fft = new FFT(this.bufferSize, 44100);
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

    // TODO Make seperate classes for seperate Browser APIs
    initAudio: function() {
       if(typeof webkitAudioContext == "undefined") {
        this.api = "mozilla";
        Amp.Manager.context = new Audio();
        Amp.Manager.context.src = this.ogg;
        Amp.Manager.context.addEventListener('MozAudioAvailable', this.audioAvailable, false);
        Amp.Manager.context.addEventListener('loadedmetadata', this.init_moz_page, false);
        Amp.Manager.context.play();
        Amp.Visualizer.animate();
      } else {
        this.api = "webkit";
        this.context = new webkitAudioContext();
        this.context.sampleRate = 44100;
        Amp.Manager.source = this.context.createBufferSource();

        this.jsProcessor = this.context.createJavaScriptNode(this.jsProcessorSize, 1, 2);
        this.jsProcessor.onaudioprocess = this.audioAvailable.bind(this);

        Amp.Manager.source.connect(this.jsProcessor);
        this.jsProcessor.connect(this.context.destination);
        this.loadSample(this.mp3);
      }
    },

    // TODO Make seperate classes for seperate Browser APIs
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
          this.signal[i] = (inputArrayL[i] + inputArrayR[i]) / 2;
        }
      } else if (Amp.Manager.api != null && Amp.Manager.api == "mozilla") {
        var framebuffer = event.frameBuffer;
        var time = event.time;
        var magnitude = null;
        var framebufferlength = Amp.Manager.context.mozFrameBufferLength;

        for(var i = 0, fbl = framebufferlength/2; i < fbl; i++) {
          Amp.Manager.signal[i] = (framebuffer[2*i] + framebuffer[2*i+1]) / 2;
        }
      }

      Amp.Manager.fft.forward(Amp.Manager.signal);

      for ( var i = 0; i < Amp.Manager.bufferSize/Amp.Manager.range; i++ ) {
        Amp.Manager.currentvalue[i] = (Amp.Manager.fft.spectrum[i] * Amp.Manager.ZOOM);
      }
    }
  };
});
define("Amp.Request", ["Amp"], function(){
  Amp.Request = {
    type: "GET",
    initialize: function(options, f) {
      if(options == null) {
        options = [];
        options["url"] = "";
      }

      this.self = new XMLHttpRequest();
      this.self.open(this.type, options["url"], true);
      this.self.responseType = "arraybuffer";

      this.self.onload = (f != null) ? f : function() {
        Amp.Manager.source.buffer = Amp.Manager.context.createBuffer(this.self.response, true);
        Amp.Manager.source.loop = false;
        Amp.Manager.source.noteOn(0);
        Amp.Visualizer.animate();
      }.bind(this);

      return this.self;
    }
  };
});
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
define("Amp.Apis.Webkit", ["Amp", "Amp.Apis"], function(){
  Amp.Apis.Webkit = {
  };
});
