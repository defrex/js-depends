
fs = require 'fs'

class Application

  provides: /dep\.provide\(['"](.+?)['"]\)/ig
  requires: /dep\.require\(['"](.+?)['"]\)/ig

  constructor: (@sourceDir, @options = {}) ->
    if not @sourceDir?
      throw new Error 'A source directory is required'
    else if not typeof @sourceDir == 'string'
      throw new Error 'Source directory must be a string'


  list: (dir = @sourceDir, clbk) ->
    @files ||= []

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

    @rawMap ||= {}
    @deps ||= {}
    files = @files

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


  sort: () ->
    @parse @sort if not @deps? and @rawMap?

    @sorted ||= []
    modules = (module for module, file of @rawMap)
    deps = Object.create @deps
    runs = 0
    max = modules.length * 2

    while modules.length > 0
      if runs++ >= max
        throw 'no many iterations'

      for mi, module of modules

        if deps[module].length == 0
          @sorted.push @rawMap[module]

          for needs, needed of deps
            for ni, nMod of needed
              if nMod == module
                deps[needs].splice(ni, 1)

          modules.splice(mi, 1)

  clean: () ->
    if @sorted?
      @output = (file.replace(@sourceDir, '') for file in @sorted)

    if @rawMap
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


exports.manage = (dir, clbk) ->
  app = new Application(dir);
  app.process (err) ->
    clbk?.call(this, err, app)


exports.writeMap = (dir, filename, clbk) ->
  app = new Application(dir);
  app.parse (err) ->
    return clbk?(err) if err

    app.clean()

    map = JSON.stringify(app.map)
    map = "dep.defineMap(#{map})"

    fs.writeFile filename, map, clbk
