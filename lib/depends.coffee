
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
    files.parse (err) ->
      return clbk?(err) if err

      files.clean()

      map = JSON.stringify(files.map)
      contents = contents + "\n\ndep.defineMap(#{map})"

      fs.writeFile filename, contents, clbk
