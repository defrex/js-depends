
Files = require('./files').Files
fs = require 'fs'

writeClient = (loader, dir, filename, clbk) ->
  fs.readFile __dirname+'/client.js', (err, contents) ->
    if err? then throw err

    files = new Files(dir);
    files.process (err) ->
      return clbk?(err) if err

      map = JSON.stringify(files.map)
      mods = JSON.stringify(files.sorted)
      contents = contents + "\n\ndep.defineMap(#{map});\n"

      if loader
        contents = contents + "\ndep.load(#{mods});\n"

      fs.writeFile filename, contents, clbk


exports.writeMap = (dir, filename, clbk) ->
  writeClient false, dir, filename, clbk

exports.writeLoader = (dir, filename, clbk) ->
  writeClient true, dir, filename, clbk

exports.manage = (dir, clbk) ->
  files = new Files(dir)
  files.process (err) ->
    clbk?.call(this, err, files)
