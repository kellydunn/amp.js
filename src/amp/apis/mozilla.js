define("Amp.Apis.Mozilla", ["Amp", "Amp.Apis"], functions(){
  Amp.Apis.Mozilla = {
    intialize : function (){
      this.name = "mozilla";
      this.context = new Audio();
      this.context.src = this.ogg;
      this.context.addEventListener('MozAudioAvailable', this.audioAvailable, false);
      this.context.addEventListener('loadedmetadata', this.init_moz_page, false);
      this.context.play();
      Amp.Visualizer.animate();
      return this;
    }
  };
});