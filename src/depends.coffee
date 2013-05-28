
path = require 'path'
fs = require 'fs'


clone = (obj) ->
    ret = {}
    for key, val of obj
      if Array.isArray val
        ret[key] = val.slice()
      else if typeof val == 'object'
        ret[key] = exports.clone(val)
      else
        ret[key] = val
    return ret


isEmpty = (obj) ->
  for own prop, val of obj
    return false
  return true


class Files

  provides: /dep\.provide\(['"](.+?)['"]\)/g
  requires: /dep\.require\(['"](.+?)['"]\)/g

  constructor: (@sourceDir = '', @options = {}) ->


  list: (dir = @sourceDir, clbk) ->

    @files ||= []

    fs.readdir dir, (err, files) =>
      return clbk?.call(this, err) if err

      next = (err) =>
        return clbk?.call(this, err) if err

        file = files.pop()

        return clbk?.call(this) if not file?

        file = path.normalize "#{dir}/#{file}"

        fs.stat file, (err, stat) =>
          return clbk?.call(this, err) if err

          if stat.isDirectory()
            @list file, next

          else if /\.js$/.test file
            @files.push file
            next()

          else
            next()

      next()


  load: (clbk) ->
    if not @files?
      return @list null, (err) =>
        return clbk?.call(this, err) if err?
        @load clbk

    files = @files.slice()
    @js = {}

    do next = =>
      return clbk?.call(this) if not (file = files.pop())

      fs.readFile file, (err, content) =>
        return clbk?.call(this, err) if err?

        @js[file] = content
        next()


  parse: (clbk) ->
    if not @js?
      return @load (err) =>
        return clbk?.call(this, err) if err?
        @parse clbk

    if @rawMap? and @deps?
      return clbk?.call(this)

    @rawMap = {}
    @deps = {}

    for file, content of @js

      requires = while tmp = @requires.exec(content) then tmp[1]
      provides = while tmp = @provides.exec(content) then tmp[1]

      if provides.length
        modules = provides
      else
        modules = ['mod'+file.replace(/\//g, '.').replace(/[^\w\.]/g, '')]

      for module in modules
        @rawMap[module] = file
        @deps[module] = requires if requires?

    clbk.call(this)


  dependsOn: (mod)->
    @parse => moduleDependsOn(mod) if not @deps? and @rawMap?

    throw new Error 'No such module: '+mod if not @deps[mod]?

    included = []

    settle = (mod)=>
      return if mod in included

      throw new Error 'Unmet dependancy: '+mod if not @deps[mod]?

      settle req for req in @deps[mod]
      included.push(mod)

    settle mod

    return included


  sort: () ->
    @parse @sort if not @deps? and @rawMap?

    if @sorted? then return

    @sorted ||= []
    modules = (module for module, file of @rawMap)
    deps = clone(@deps)
    runs = 0
    max = modules.length * 3

    # if modules.length reaches 0, we're done
    while modules.length > 0
      #loop over all modules
      for mi, module of modules
        #if the module has no more deps, we can push it to sorted
        if deps[module].length == 0
          @sorted.push module

          #removes all referances to the sorted dep
          for needs, needed of deps
            for ni, nMod of needed
              if nMod == module
                deps[needs].splice(ni, 1)

          #remove the sorted dep form the module list
          modules.splice(mi, 1)
          delete deps[module]

      # after a ton of loops, we print a helpful error
      if runs++ >= max
        #invert deps, since it's easier to read that way
        needed = {}
        for module, needs of deps
          for need in needs
            needed[need] ||= []
            needed[need].push(module)

        error = 'Cannot resolve Dependancies \n'

        #look for anything is is required, but has no provider
        missing = {}
        for module, needs of needed
          if not @deps[module]?
            missing[module] = needs

        if not isEmpty(missing)
          error += 'missing {required: [requires..]}: '
          error += JSON.stringify(missing, null, 2)
          return error

        #look for circular dependancies
        for required, requires of needed
          for mod in requires
            if required in needed[mod]
              error += "A circular dependancy has been found for:\n#{required}\n#{mod}"
              return error

        error += 'An unknown error occured'
        return error
    return


  clean: ->
    if @sorted? and not @output?
      @output = (@rawMap[file].replace(@sourceDir, '') for file in @sorted)

    if @rawMap and not @map?
      @map ||= {}
      for module, filename of @rawMap
        @map[module] = filename.replace @sourceDir, ''


  process: (clbk) ->
    @parse (err) ->
      if err? then return clbk?.call(this, err)

      sortErr = @sort()
      if sortErr? then return clbk?.call(this, sortErr)

      @clean()
      clbk.call(this)


  getClient: (load, clbk) ->
    fs.readFile __dirname+'/client.js', (err, contents) =>
      if err? then return clbk?(err)

      @process (err) ->
        return clbk?(err) if err

        map = JSON.stringify(@map)
        contents = contents + "\n\ndep.defineMap(#{map});\n"

        if load
          mods = JSON.stringify(@sorted)
          contents = contents + "\ndep.load(#{mods});\n"

        clbk null, contents


  writeClient: (filename, load, clbk) ->
    @getClient load, (err, content)->
      return clbk?(err) if err

      fs.writeFile filename, content, clbk


exports.manage = (dir, clbk) ->
  files = new Files(dir)
  files.process (err) -> clbk?(err, files)

exports.Files = Files
