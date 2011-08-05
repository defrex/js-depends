
Files = require('./files').Files
NodeDep = require('./nodeDep').NodeDep
fs = require 'fs'
vm = require 'vm'


exports.writeMap = (dir, filename, clbk) ->
  new Files(dir).writeClient filename, false, clbk


exports.getMap = (dir, clbk) ->
  new Files(dir).getClient false, clbk


exports.writeLoader = (dir, filename, clbk) ->
  new Files(dir).writeClient filename, true, clbk


exports.getLoader = (dir, clbk) ->
  new Files(dir).getClient true, clbk


exports.manage = (dir, clbk) ->
  files = new Files(dir)
  files.process (err) -> clbk?(err, files)


exports.manageNode = (options, clbk) ->
  throw new Error 'An src directory is required.' if not options.src?

  options.context ||= {}

  exports.manage options.src, (err, files) ->
    return clbk err if err?
    clbk null, new NodeDep files, options


exports.NodeDep = NodeDep
exports.Files = Files
