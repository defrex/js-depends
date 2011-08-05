var Files, NodeDep, fs, vm;
Files = require('./files').Files;
NodeDep = require('./nodeDep').NodeDep;
fs = require('fs');
vm = require('vm');
exports.writeMap = function(dir, filename, clbk) {
  return new Files(dir).writeClient(filename, false, clbk);
};
exports.getMap = function(dir, clbk) {
  return new Files(dir).getClient(false, clbk);
};
exports.writeLoader = function(dir, filename, clbk) {
  return new Files(dir).writeClient(filename, true, clbk);
};
exports.getLoader = function(dir, clbk) {
  return new Files(dir).getClient(true, clbk);
};
exports.manage = function(dir, clbk) {
  var files;
  files = new Files(dir);
  return files.process(function(err) {
    return typeof clbk === "function" ? clbk(err, files) : void 0;
  });
};
exports.manageNode = function(options, clbk) {
  if (!(options.src != null)) {
    throw new Error('An src directory is required.');
  }
  options.context || (options.context = {});
  return exports.manage(options.src, function(err, files) {
    if (err != null) {
      return clbk(err);
    }
    return clbk(null, new NodeDep(files, options));
  });
};
exports.NodeDep = NodeDep;
exports.Files = Files;