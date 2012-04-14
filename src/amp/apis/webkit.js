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