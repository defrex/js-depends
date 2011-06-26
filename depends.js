var Application, fs;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
fs = require('fs');
Application = (function() {
  Application.prototype.provides = /dep\.provide\(['"](.+?)['"]\)/ig;
  Application.prototype.requires = /dep\.require\(['"](.+?)['"]\)/ig;
  function Application(sourceDir, options) {
    this.sourceDir = sourceDir;
    this.options = options != null ? options : {};
    if (!(this.sourceDir != null)) {
      throw new Error('A source directory is required');
    } else if (!typeof this.sourceDir === 'string') {
      throw new Error('Source directory must be a string');
    }
  }
  Application.prototype.list = function(dir, clbk) {
    var t;
    if (dir == null) {
      dir = this.sourceDir;
    }
    this.files || (this.files = []);
    this.t = 123;
    t = this.t;
    return fs.readdir(this.sourceDir, __bind(function(err, files) {
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
          }
        }, this));
      }, this);
      return next();
    }, this));
  };
  Application.prototype.parse = function(clbk) {
    var files, next;
    if (!(this.files != null)) {
      return this.list(null, __bind(function(err) {
        if (err) {
          return clbk != null ? clbk.call(this, err) : void 0;
        }
        return this.parse(clbk);
      }, this));
    }
    this.map || (this.map = {});
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
          this.map[module] = file;
          if (requires != null) {
            this.deps[module] = requires;
          }
        }
        return next();
      }, this));
    }, this);
    return next();
  };
  Application.prototype.sort = function() {
    var deps, file, max, mi, module, modules, nMod, needed, needs, ni, runs, _results;
    if (!(this.deps != null) && (this.map != null)) {
      this.parse(this.sort);
    }
    this.sorted || (this.sorted = []);
    modules = (function() {
      var _ref, _results;
      _ref = this.map;
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
      if (runs++ >= max) {
        throw 'no many iterations';
      }
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (mi in modules) {
          module = modules[mi];
          _results2.push((function() {
            if (deps[module].length === 0) {
              this.sorted.push(this.map[module]);
              for (needs in deps) {
                needed = deps[needs];
                for (ni in needed) {
                  nMod = needed[ni];
                  if (nMod === module) {
                    deps[needs].splice(ni, 1);
                  }
                }
              }
              return modules.splice(mi, 1);
            }
          }).call(this));
        }
        return _results2;
      }).call(this));
    }
    return _results;
  };
  Application.prototype.process = function(clbk) {
    return this.list(null, __bind(function(err) {
      if (err) {
        return clbk != null ? clbk.call(this, err) : void 0;
      }
      return this.parse(__bind(function(err) {
        if (err) {
          return clbk != null ? clbk.call(this, err) : void 0;
        }
        this.sort();
        return clbk.call(this);
      }, this));
    }, this));
  };
  return Application;
})();
exports.manage = function(dir, clbk) {
  var app;
  app = new Application(dir);
  return app.process(function(err) {
    return clbk != null ? clbk.call(this, err, app) : void 0;
  });
};
exports.writeMap = function(dir, filename, clbk) {
  var app;
  app = new Application(dir);
  return app.parse(function(err) {
    var map;
    if (err) {
      return typeof clbk === "function" ? clbk(err) : void 0;
    }
    map = JSON.stringify(app.map);
    map = "dep.defineMap(" + map + ")";
    return fs.writeFile(filename, map, clbk);
  });
};