var Files, fs;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
fs = require('fs');
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
    this.rawMap || (this.rawMap = {});
    this.deps || (this.deps = {});
    files = this.files;
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
        if (provides != null) {
          modules = provides;
        } else {
          modules = ['mod-' + file.replace(/[^\w]/, '')];
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
    var deps, file, max, mi, module, modules, nMod, needed, needs, ni, runs, _results;
    if (!(this.deps != null) && (this.rawMap != null)) {
      this.parse(this.sort);
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
    deps = Object.create(this.deps);
    runs = 0;
    max = modules.length * 2;
    _results = [];
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
        }
      }
      _results.push((function() {
        if (runs++ >= max) {
          needed = {};
          for (module in deps) {
            needs = deps[module];
            needed[needs] || (needed[needs] = []);
            needed[needs].push(module);
          }
          console.log('{missing module name: [needed by..]}:');
          console.log(JSON.stringify(needed, null, 2));
          throw 'Cannot resolve Dependancies';
        }
      })());
    }
    return _results;
  };
  Files.prototype.clean = function() {
    var file, filename, module, _ref, _results;
    if (this.sorted != null) {
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
    if (this.rawMap) {
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
    return this.list(null, __bind(function(err) {
      if (err) {
        return clbk != null ? clbk.call(this, err) : void 0;
      }
      return this.parse(__bind(function(err) {
        if (err) {
          return clbk != null ? clbk.call(this, err) : void 0;
        }
        this.sort();
        this.clean();
        return clbk.call(this);
      }, this));
    }, this));
  };
  return Files;
})();
exports.Files = Files;