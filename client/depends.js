// Generated by CoffeeScript 1.6.2
window.dep = {};

window.dep._loaded = {};

window.dep.provide = function(module) {
  var cur, split, _name;

  split = module.split('.');
  cur = window;
  while (split.length) {
    cur = cur[_name = split.shift()] || (cur[_name] = {});
  }
  return window.dep._loaded[module] = true;
};

window.dep.require = function(module) {
  if (!window.dep._loaded[module]) {
    return typeof console.warn === "function" ? console.warn("Depends: no module named " + module) : void 0;
  }
};
