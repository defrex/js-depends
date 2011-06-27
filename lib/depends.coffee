
Files = require('./files').Files
fs = require 'fs'

exports.manage = (dir, clbk) ->
  files = new Files(dir)
  files.process (err) ->
    clbk?.call(this, err, files)


exports.writeMap = (dir, filename, clbk) ->

  fs.readFile __dirname+'/client.js', (err, contents) ->
    if err? then throw err

    files = new Files(dir);
    files.process (err) ->
      return clbk?(err) if err

      map = JSON.stringify(files.map)
      mods = JSON.stringify(files.sorted)
      contents = contents + """\n
      dep.defineMap(#{map});
      dep.load(#{mods});"""

      fs.writeFile filename, contents, clbk
