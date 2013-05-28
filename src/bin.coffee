
depends = require './depends'
fs = require 'fs'
cli = require 'cli'
path = require 'path'

currentPackage = JSON.parse fs.readFileSync path.join __dirname, '/../package.json'

cli.setApp currentPackage.name, currentPackage.version
cli.enable 'version'

cli.setUsage 'depends [OPTIONS] [js-directory]'
cli.parse
  'absolute': ['a', 'Output absolute paths (useful for piping the output).', 'boolean', false]
  'include-base': ['i', 'Output paths will include the js directory as passed in.', 'boolean', false]
  'script': ['s', 'Wrap output in script tags.', 'boolean', false]

cli.main (args, opt) ->
  jsDirectory = path.normalize(args[0] || '.')

  depends.manage jsDirectory, (err, files) ->
    if err? then throw err

    if opt['script']
      for file in files.output
        console.log "<script src=\"#{file}\"></script>"

    else if opt['absolute']
      for file in files.output
        console.log path.resolve(jsDirectory, file)

    else if opt['include-base']
      for file in files.output
        console.log path.join(jsDirectory, file)

    else
      for file in files.output
        console.log file
