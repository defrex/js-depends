var Files, fs, writeClient;
Files = require('./files').Files;
fs = require('fs');
writeClient = function(loader, dir, filename, clbk) {
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
      contents = contents + ("\n\ndep.defineMap(" + map + ");\n");
      if (loader) {
        contents = contents + ("\ndep.load(" + mods + ");\n");
      }
      return fs.writeFile(filename, contents, clbk);
    });
  });
};
exports.writeMap = function(dir, filename, clbk) {
  return writeClient(false, dir, filename, clbk);
};
exports.writeLoader = function(dir, filename, clbk) {
  return writeClient(true, dir, filename, clbk);
};
exports.manage = function(dir, clbk) {
  var files;
  files = new Files(dir);
  return files.process(function(err) {
    return clbk != null ? clbk.call(this, err, files) : void 0;
  });
};