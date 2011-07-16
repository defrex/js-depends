(function() {
  #!/usr/bin/env node
;  var cli, depends, fs, package;
  depends = require('./depends');
  fs = require('fs');
  cli = require('cli');
  package = JSON.parse(fs.readFileSync("" + __dirname + "/../package.json"));
  cli.setApp(package.name, package.version);
  cli.enable('version');
  cli.setUsage('depends [OPTIONS] [js-directory]');
  cli.parse({
    loader: ['l', 'Location of runtime loader file', 'file', false],
    map: ['m', 'Location of runtime mapping file', 'file', false],
    script: ['s', 'Wrap output in script tags', 'boolean', false]
  });
  cli.main(function(args, opt) {
    var src;
    src = args[0] || '.';
    return fs.realpath(src, function(err, path) {
      if (err != null) {
        throw err;
      }
      if (opt.map) {
        return depends.writeMap(path, opt.loader, function(err) {
          if (err != null) {
            throw err;
          }
          return console.log('done');
        });
      } else if (opt.loader) {
        return depends.writeLoader(path, opt.loader, function(err) {
          if (err != null) {
            throw err;
          }
          return console.log('done');
        });
      } else {
        return depends.manage(path, function(err, files) {
          var file, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
          if (err != null) {
            throw err;
          }
          if (opt.script) {
            _ref = files.output;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              file = _ref[_i];
              _results.push(console.log("<script src=\"" + file + "\"></script>"));
            }
            return _results;
          } else {
            _ref2 = files.output;
            _results2 = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              file = _ref2[_j];
              _results2.push(console.log(file));
            }
            return _results2;
          }
        });
      }
    });
  });
}).call(this);
