
dep =
  map: {}
  loaded: {}


dep.defineMap = (map) ->
  dep.map = map


dep.load = (mods) ->
  dep.require mod for mod in mods


dep.provide = (module) ->
  split = module.split('.')
  cur = window
  cur = cur[split.shift()] ||= {} while split.length

  dep.loaded[module] = true


dep.require = (module) ->
  return if dep.loaded[module]

  throw "No mapped module named #{module}" if not dep.map[module]?

  request = new XMLHttpRequest();
  request.open 'GET', dep.map[module]

  req = new XMLHttpRequest()
  req.open('GET', dep.map[module], false)
  req.send()

  if req.status == 200
    script = document.createElement('script')
    script.text = req.responseText
    document.head.appendChild(script)
  else
    throw "module #{module} cannot be loaded from #{dep.map[module]}"


window.dep = dep
