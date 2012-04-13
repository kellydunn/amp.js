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