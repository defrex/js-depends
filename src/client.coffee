
window.dep = {}
window.dep._loaded = {}

window.dep.provide = (module) ->
  split = module.split('.')
  cur = window
  cur = cur[split.shift()] ||= {} while split.length

  window.dep._loaded[module] = true

window.dep.require = (module) ->
  if not window.dep._loaded[module]
    console.warn?("Depends: no module named #{module}")
