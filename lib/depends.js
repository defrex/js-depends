var Files, fs;
Files = require('./files').Files;
fs = require('fs');
exports.manage = function(dir, clbk) {
  var files;
  files = new Files(dir);
  return files.process(function(err) {
    return clbk != null ? clbk.call(this, err, files) : void 0;
  });
};
exports.writeMap = function(dir, filename, clbk) {
  return fs.readFile(__dirname + '/client.js', function(err, contents) {
    var files;
    if (err != null) {
      throw err;
    }
    files = new Files(dir);
    return files.process(function(err) {
      var map, mods;
      if (err) {
        return typeof clbk === "function" ? clbk(err) : void 0;
      }
      map = JSON.stringify(files.map);
      mods = JSON.stringify(files.sorted);
      contents = contents + ("\n\ndep.defineMap(" + map + ");\ndep.load(" + mods + ");");
      return fs.writeFile(filename, contents, clbk);
    });
  });
};