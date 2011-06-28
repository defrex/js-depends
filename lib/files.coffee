
fs = require 'fs'

class Files

  provides: /dep\.provide\(['"](.+?)['"]\)/g
  requires: /dep\.require\(['"](.+?)['"]\)/g

  constructor: (@sourceDir, @options = {}) ->
    if not @sourceDir?
      throw new Error 'A source directory is required'
    else if not typeof @sourceDir == 'string'
      throw new Error 'Source directory must be a string'


  list: (dir = @sourceDir, clbk) ->
    if @files? then return clbk?.call(this)

    @files = []

    dir += '/' if dir[dir.length-1] != '/'

    fs.readdir dir, (err, files) =>
      return clbk?.call(this, err) if err

      next = (err) =>
        return clbk?.call(this, err) if err

        file = files.pop()

        return clbk?.call(this) if not file?

        file = "#{dir}#{file}"

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


  parse: (clbk) ->
    if not @files?
      return @list null, (err) =>
        return clbk?.call(this, err) if err
        @parse clbk

    if @rawMap? and @deps?
      return clbk?.call(this)

    @rawMap = {}
    @deps = {}
    files = @files.slice()

    next = (err) =>
      return clbk?.call(this, err) if err

      file = files.pop()

      return clbk?.call(this) if not file?

      fs.readFile file, (err, content) =>
        return clbk?.call(this, err) if err

        requires = while tmp = @requires.exec(content)
          tmp[1]
        provides = while tmp = @provides.exec(content)
          tmp[1]

        if provides?
          modules = provides
        else
          modules = ['mod-'+file.replace(/[^\w]/, '')]

        for module in modules
          @rawMap[module] = file
          @deps[module] = requires if requires?

        next()
    next()


  newDeps: () ->
    if not @deps? then throw 'cannot clone @deps when it doesn\t exist'

    newDeps = {}
    for dep, needs of @deps
      newDeps[dep] = needs.slice()

    return newDeps

  sort: () ->
    @parse @sort if not @deps? and @rawMap?

    if @sorted? then return

    @sorted ||= []
    modules = (module for module, file of @rawMap)
    deps = @newDeps()
    runs = 0
    max = modules.length * 2

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

        #are there any needed, that don't need anything?
        missing = {}
        for module, needs of needed
          if not @deps[module]?
#            console.log 'missing', module, @deps[module]
            missing[module] = needs

        error = 'Cannot resolve Dependancies \n'
#        error += '\n\n@deps: '+JSON.stringify(@deps, null, 2)
#        error += '\n\ndeps: '+JSON.stringify(deps, null, 2)
#        error += '\n\nneeded: '+JSON.stringify(needed, null, 2)
        error += 'missing {required: [requires..]}: '+JSON.stringify(missing, null, 2)
#        error += 'Unmet dependancies {dep: [needed by...]}: '+JSON.stringify(missing, null, 2)
        throw error


  clean: () ->
    if @sorted? and not @output?
      @output = (@rawMap[file].replace(@sourceDir, '') for file in @sorted)

    if @rawMap and not @map?
      @map ||= {}
      for module, filename of @rawMap
        @map[module] = filename.replace @sourceDir, ''


  process: (clbk) ->
    @list null, (err) =>
      return clbk?.call(this, err) if err
      @parse (err) =>
        return clbk?.call(this, err) if err
        @sort()
        @clean()
        clbk.call(this)


  writeClient: (filename, load, clbk) ->
    fs.readFile __dirname+'/client.js', (err, contents) =>
      if err? then return clbk?(err)

      @process (err) ->
        return clbk?(err) if err

        map = JSON.stringify(@map)
        contents = contents + "\n\ndep.defineMap(#{map});\n"

        if load
          mods = JSON.stringify(@sorted)
          contents = contents + "\ndep.load(#{mods});\n"

        fs.writeFile filename, contents, clbk


exports.Files = Files
