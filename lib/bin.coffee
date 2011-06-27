`#!/usr/bin/env node
`

depends = require './depends'
fs = require 'fs'
cli = require 'cli'

cli.parse
  src: ['s', 'Source directory', 'path', '.']
  loader: ['l', 'Location of runtime loader file', 'file', false]

cli.main (args, opt) ->
  fs.realpath opt.src, (err, path) ->
    if err? then throw err

    if opt.loader
      depends.writeMap path, opt.loader, (err) ->
        if err? then throw err

        console.log 'done'

    else
      depends.manage path, (err, files) ->
        if err? then throw err

        console.log file for file in files.output
