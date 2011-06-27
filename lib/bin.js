#!/usr/bin/env node
;var cli, depends, fs;
depends = require('./depends');
fs = require('fs');
cli = require('cli');
cli.parse({
  src: ['s', 'Source directory', 'path', '.'],
  loader: ['l', 'Location of runtime loader file', 'file', false]
});
cli.main(function(args, opt) {
  return fs.realpath(opt.src, function(err, path) {
    if (err != null) {
      throw err;
    }
    if (opt.loader) {
      return depends.writeMap(path, opt.loader, function(err) {
        if (err != null) {
          throw err;
        }
        return console.log('done');
      });
    } else {
      return depends.manage(path, function(err, files) {
        var file, _i, _len, _ref, _results;
        if (err != null) {
          throw err;
        }
        _ref = files.output;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          _results.push(console.log(file));
        }
        return _results;
      });
    }
  });
});