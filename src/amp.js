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