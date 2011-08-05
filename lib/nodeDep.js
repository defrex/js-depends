var NodeDep, fs, request, vm, _;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
vm = require('vm');
fs = require('fs');
request = require('request');
_ = require('underscore')._;
NodeDep = (function() {
  function NodeDep(files, options) {
    this.files = files;
    this.options = options != null ? options : {};
    this.context = options.context || {};
    this.context.dep = this;
    this.loaded = {};
  }
  NodeDep.prototype.require = function(mod) {
    if (!this.loaded[mod]) {
      throw new Error('Module not found: ' + mod);
    }
  };
  NodeDep.prototype.provide = function(mod) {
    var cur, split, _name;
    split = mod.split('.');
    cur = this.context;
    while (split.length) {
      cur = cur[_name = split.shift()] || (cur[_name] = {});
    }
    return this.loaded[mod] = true;
  };
  NodeDep.prototype.execute = function(mod, clbk) {
    var content, file, mods, _i, _len;
    if (!this.loaded[mod]) {
      mods = this.files.dependsOn(mod);
      for (_i = 0, _len = mods.length; _i < _len; _i++) {
        mod = mods[_i];
        file = this.files.rawMap[mod];
        content = this.files.js[file];
        vm.runInNewContext(content, this.context, file);
      }
    }
    return clbk();
  };
  NodeDep.prototype.dlIntoContext = function(url, clbk) {
    return request({
      url: url
    }, __bind(function(err, res, body) {
      if (err != null) {
        return clbk(err);
      }
      vm.runInNewContext(body, this.context, url);
      return clbk();
    }, this));
  };
  NodeDep.prototype.inContext = function(func) {
    var funcStr;
    funcStr = "(" + (func.toString()) + ")();";
    return vm.runInNewContext(funcStr, this.context, func.name + 'InDepContext');
  };
  return NodeDep;
})();
exports.NodeDep = NodeDep;