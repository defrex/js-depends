
exports.clone = (obj) ->
    ret = {}
    for key, val of obj
      if Array.isArray val
        ret[key] = val.slice()
      else if typeof val == 'object'
        ret[key] = exports.clone(val)
      else
        ret[key] = val
    return ret

exports.isEmpty = (obj) ->
  for own prop, val of obj
    return false
  return true
