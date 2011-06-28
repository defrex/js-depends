var __hasProp = Object.prototype.hasOwnProperty;
exports.clone = function(obj) {
  var key, ret, val;
  ret = {};
  for (key in obj) {
    val = obj[key];
    if (Array.isArray(val)) {
      ret[key] = val.slice();
    } else if (typeof val === 'object') {
      ret[key] = exports.clone(val);
    } else {
      ret[key] = val;
    }
  }
  return ret;
};
exports.isEmpty = function(obj) {
  var prop, val;
  for (prop in obj) {
    if (!__hasProp.call(obj, prop)) continue;
    val = obj[prop];
    return false;
  }
  return true;
};