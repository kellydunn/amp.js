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
        Amp.Manager.source.buffer = Amp.Manager.api.context.createBuffer(this.self.response, true);
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
define("Amp.Apis.Webkit", ["Amp", "Amp.Apis"], function(){
  Amp.Apis.Webkit = {
    jsProcessor : 0,
    jsProcessorSize: 4096,

    initialize : function() {
      this.name = "webkit";

      this.context = new webkitAudioContext();
      this.context.sampleRate = 44100;
      Amp.Manager.source = this.context.createBufferSource();

      this.jsProcessor = this.context.createJavaScriptNode(this.jsProcessorSize, 1, 2);
      this.jsProcessor.onaudioprocess = this.audioAvailable.bind(this);

      Amp.Manager.source.connect(this.jsProcessor);
      this.jsProcessor.connect(this.context.destination);
      this.loadSample(Amp.Manager.mp3);

      return this;
    },

    audioAvailable : function(event) {
      var inputArrayL = event.inputBuffer.getChannelData(0);
      var inputArrayR = event.inputBuffer.getChannelData(1);
      var outputArrayL = event.outputBuffer.getChannelData(0);
      var outputArrayR = event.outputBuffer.getChannelData(1);

      var n = inputArrayL.length;

      for (var i = 0; i < n; i++) {
        outputArrayL[i] = inputArrayL[i];
        outputArrayR[i] = inputArrayR[i];
        Amp.Manager.signal[i] = (inputArrayL[i] + inputArrayR[i]) / 2;
      }

      Amp.Manager.audioAvailable(event);
    },

    loadSample: function(url) {
      var request = Amp.Request.initialize({url: url});
      request.send();
    }
  };
});
