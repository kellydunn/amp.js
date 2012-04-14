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
      this.jsProcessor.onaudioprocess = Amp.Manager.audioAvailable.bind(Amp.Manager);

      Amp.Manager.source.connect(this.jsProcessor);
      this.jsProcessor.connect(this.context.destination);
      this.loadSample(Amp.Manager.mp3);

      return this;
    },

    loadSample: function(url) {
      var request = Amp.Request.initialize({url: url});
      request.send();
    }
  };
});