var dep;
dep = {
  map: {},
  loaded: {}
};
dep.defineMap = function(map) {
  return dep.map = map;
};
dep.load = function(mods) {
  var mod, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = mods.length; _i < _len; _i++) {
    mod = mods[_i];
    _results.push(dep.require(mod));
  }
  return _results;
};
dep.provide = function(module) {
  var cur, split, _name;
  if (dep.loaded[module]) {
    throw new Error("Module " + module + " already loaded.");
  }
  split = module.split('.');
  cur = window;
  while (split.length) {
    cur = cur[_name = split.shift()] || (cur[_name] = {});
  }
  return dep.loaded[module] = true;
};
dep.require = function(module) {
  var req, request, script;
  if (dep.loaded[module]) {
    return;
  }
  if (!(dep.map[module] != null)) {
    throw "No mapped module named " + module;
  }
  request = new XMLHttpRequest();
  request.open('GET', dep.map[module]);
  req = new XMLHttpRequest();
  req.open('GET', dep.map[module], false);
  req.send();
  if (req.status === 200) {
    script = document.createElement('script');
    script.text = req.responseText;
    return document.head.appendChild(script);
  } else {
    throw "module " + module + " cannot be loaded from " + dep.map[module];
  }
};
window.dep = dep;

dep.defineMap({"mod.home.defrex.code.depends.test.map.js":"/map.js","two":"/scripts/two.js","three":"/scripts/three.js","four":"/scripts/four.js","one":"/scripts/one.js","mod.home.defrex.code.depends.test.run.js":"/run.js"});
