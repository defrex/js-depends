`#!/usr/bin/env node
`

depends = require './depends'
fs = require 'fs'
cli = require 'cli'
path = require 'path'

pkg = JSON.parse fs.readFileSync path.join __dirname, '/../package.json'

cli.setApp pkg.name, pkg.version
cli.enable 'version'

cli.setUsage 'depends [OPTIONS] [js-directory]'
cli.parse
  loader: ['l', 'Location of runtime loader file', 'file', false]
  map: ['m', 'Location of runtime mapping file', 'file', false]
  script: ['s', 'Wrap output in script tags', 'boolean', false]

cli.main (args, opt) ->
  src = args[0] || '.'

  fs.realpath src, (err, path) ->
    if err? then throw err

    if opt.map
      depends.writeMap path, opt.loader, (err) ->
        if err? then throw err
        console.log 'done'

    else if opt.loader
      depends.writeLoader path, opt.loader, (err) ->
        if err? then throw err
        console.log 'done'

    else
      depends.manage path, (err, files) ->
        if err? then throw err

        if opt.script
          for file in files.output
            console.log "<script src=\"#{file}\"></script>"
        else
          console.log file for file in files.output
