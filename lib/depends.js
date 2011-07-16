(function() {
  var Files, fs;
  Files = require('./files').Files;
  fs = require('fs');
  exports.writeMap = function(dir, filename, clbk) {
    return new Files(dir).writeClient(filename, false, clbk);
  };
  exports.writeLoader = function(dir, filename, clbk) {
    return new Files(dir).writeClient(filename, true, clbk);
  };
  exports.manage = function(dir, clbk) {
    var files;
    files = new Files(dir);
    return files.process(function(err) {
      return clbk != null ? clbk.call(this, err, files) : void 0;
    });
  };
}).call(this);
