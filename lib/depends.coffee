
Files = require('./files').Files
fs = require 'fs'


exports.writeMap = (dir, filename, clbk) ->
  new Files(dir).writeClient filename, false, clbk

exports.writeLoader = (dir, filename, clbk) ->
  new Files(dir).writeClient filename, true, clbk

exports.manage = (dir, clbk) ->
  files = new Files(dir)
  files.process (err) ->
    clbk?.call(this, err, files)
