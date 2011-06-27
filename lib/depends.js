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
    return files.parse(function(err) {
      var map;
      if (err) {
        return typeof clbk === "function" ? clbk(err) : void 0;
      }
      files.clean();
      map = JSON.stringify(files.map);
      contents = contents + ("\n\ndep.defineMap(" + map + ")");
      return fs.writeFile(filename, contents, clbk);
    });
  });
};