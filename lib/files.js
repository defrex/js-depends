(function() {
  var Files, fs, util;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  fs = require('fs');
  util = require('./util');
  Files = (function() {
    Files.prototype.provides = /dep\.provide\(['"](.+?)['"]\)/g;
    Files.prototype.requires = /dep\.require\(['"](.+?)['"]\)/g;
    function Files(sourceDir, options) {
      this.sourceDir = sourceDir;
      this.options = options != null ? options : {};
      if (!(this.sourceDir != null)) {
        throw new Error('A source directory is required');
      } else if (!typeof this.sourceDir === 'string') {
        throw new Error('Source directory must be a string');
      }
    }
    Files.prototype.list = function(dir, clbk) {
      if (dir == null) {
        dir = this.sourceDir;
      }
      this.files || (this.files = []);
      if (dir[dir.length - 1] !== '/') {
        dir += '/';
      }
      return fs.readdir(dir, __bind(function(err, files) {
        var next;
        if (err) {
          return clbk != null ? clbk.call(this, err) : void 0;
        }
        next = __bind(function(err) {
          var file;
          if (err) {
            return clbk != null ? clbk.call(this, err) : void 0;
          }
          file = files.pop();
          if (!(file != null)) {
            return clbk != null ? clbk.call(this) : void 0;
          }
          file = "" + dir + file;
          return fs.stat(file, __bind(function(err, stat) {
            if (err) {
              return clbk != null ? clbk.call(this, err) : void 0;
            }
            if (stat.isDirectory()) {
              return this.list(file, next);
            } else if (/\.js$/.test(file)) {
              this.files.push(file);
              return next();
            } else {
              return next();
            }
          }, this));
        }, this);
        return next();
      }, this));
    };
    Files.prototype.parse = function(clbk) {
      var files, next;
      if (!(this.files != null)) {
        return this.list(null, __bind(function(err) {
          if (err) {
            return clbk != null ? clbk.call(this, err) : void 0;
          }
          return this.parse(clbk);
        }, this));
      }
      if ((this.rawMap != null) && (this.deps != null)) {
        return clbk != null ? clbk.call(this) : void 0;
      }
      this.rawMap = {};
      this.deps = {};
      files = this.files.slice();
      next = __bind(function(err) {
        var file;
        if (err) {
          return clbk != null ? clbk.call(this, err) : void 0;
        }
        file = files.pop();
        if (!(file != null)) {
          return clbk != null ? clbk.call(this) : void 0;
        }
        return fs.readFile(file, __bind(function(err, content) {
          var module, modules, provides, requires, tmp, _i, _len;
          if (err) {
            return clbk != null ? clbk.call(this, err) : void 0;
          }
          requires = (function() {
            var _results;
            _results = [];
            while (tmp = this.requires.exec(content)) {
              _results.push(tmp[1]);
            }
            return _results;
          }).call(this);
          provides = (function() {
            var _results;
            _results = [];
            while (tmp = this.provides.exec(content)) {
              _results.push(tmp[1]);
            }
            return _results;
          }).call(this);
          if (provides.length) {
            modules = provides;
          } else {
            modules = ['mod' + file.replace(/\//g, '.').replace(/[^\w\.]/g, '')];
          }
          for (_i = 0, _len = modules.length; _i < _len; _i++) {
            module = modules[_i];
            this.rawMap[module] = file;
            if (requires != null) {
              this.deps[module] = requires;
            }
          }
          return next();
        }, this));
      }, this);
      return next();
    };
    Files.prototype.sort = function() {
      var deps, error, file, max, mi, missing, mod, module, modules, nMod, need, needed, needs, ni, required, requires, runs, _i, _j, _len, _len2;
      if (!(this.deps != null) && (this.rawMap != null)) {
        this.parse(this.sort);
      }
      if (this.sorted != null) {
        return;
      }
      this.sorted || (this.sorted = []);
      modules = (function() {
        var _ref, _results;
        _ref = this.rawMap;
        _results = [];
        for (module in _ref) {
          file = _ref[module];
          _results.push(module);
        }
        return _results;
      }).call(this);
      deps = util.clone(this.deps);
      runs = 0;
      max = modules.length * 3;
      while (modules.length > 0) {
        for (mi in modules) {
          module = modules[mi];
          if (deps[module].length === 0) {
            this.sorted.push(module);
            for (needs in deps) {
              needed = deps[needs];
              for (ni in needed) {
                nMod = needed[ni];
                if (nMod === module) {
                  deps[needs].splice(ni, 1);
                }
              }
            }
            modules.splice(mi, 1);
            delete deps[module];
          }
        }
        if (runs++ >= max) {
          needed = {};
          for (module in deps) {
            needs = deps[module];
            for (_i = 0, _len = needs.length; _i < _len; _i++) {
              need = needs[_i];
              needed[need] || (needed[need] = []);
              needed[need].push(module);
            }
          }
          error = 'Cannot resolve Dependancies \n';
          missing = {};
          for (module in needed) {
            needs = needed[module];
            if (!(this.deps[module] != null)) {
              missing[module] = needs;
            }
          }
          if (!util.isEmpty(missing)) {
            error += 'missing {required: [requires..]}: ';
            error += JSON.stringify(missing, null, 2);
            return error;
          }
          for (required in needed) {
            requires = needed[required];
            for (_j = 0, _len2 = requires.length; _j < _len2; _j++) {
              mod = requires[_j];
              if (__indexOf.call(needed[mod], required) >= 0) {
                error += "A circular dependancy has been found for:\n" + required + "\n" + mod;
                return error;
              }
            }
          }
          error += 'An unknown error occured';
          return error;
        }
      }
    };
    Files.prototype.clean = function() {
      var file, filename, module, _ref, _results;
      if ((this.sorted != null) && !(this.output != null)) {
        this.output = (function() {
          var _i, _len, _ref, _results;
          _ref = this.sorted;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            file = _ref[_i];
            _results.push(this.rawMap[file].replace(this.sourceDir, ''));
          }
          return _results;
        }).call(this);
      }
      if (this.rawMap && !(this.map != null)) {
        this.map || (this.map = {});
        _ref = this.rawMap;
        _results = [];
        for (module in _ref) {
          filename = _ref[module];
          _results.push(this.map[module] = filename.replace(this.sourceDir, ''));
        }
        return _results;
      }
    };
    Files.prototype.process = function(clbk) {
      return this.list(null, function(err) {
        if (err != null) {
          return clbk != null ? clbk.call(this, err) : void 0;
        }
        return this.parse(function(err) {
          var sortErr;
          if (err != null) {
            return clbk != null ? clbk.call(this, err) : void 0;
          }
          sortErr = this.sort();
          if (sortErr != null) {
            return clbk != null ? clbk.call(this, sortErr) : void 0;
          }
          this.clean();
          return clbk.call(this);
        });
      });
    };
    Files.prototype.writeClient = function(filename, load, clbk) {
      return fs.readFile(__dirname + '/client.js', __bind(function(err, contents) {
        if (err != null) {
          return typeof clbk === "function" ? clbk(err) : void 0;
        }
        return this.process(function(err) {
          var map, mods;
          if (err) {
            return typeof clbk === "function" ? clbk(err) : void 0;
          }
          map = JSON.stringify(this.map);
          contents = contents + ("\n\ndep.defineMap(" + map + ");\n");
          if (load) {
            mods = JSON.stringify(this.sorted);
            contents = contents + ("\ndep.load(" + mods + ");\n");
          }
          return fs.writeFile(filename, contents, clbk);
        });
      }, this));
    };
    return Files;
  })();
  exports.Files = Files;
}).call(this);
