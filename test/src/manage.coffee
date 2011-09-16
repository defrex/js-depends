
test = require('tap').test
fs = require 'fs'

depends = require '../lib/depends'

test 'manage', (t)->

  depends.manage "#{__dirname}/scripts/", (err, scripts) ->
    t.ok not err?, 'no init error'

    test 'map', (t)->
      t.equal scripts.map.one, "one.js"
      t.equal scripts.map.two, "two.js"
      t.equal scripts.map.three, "three.js"
      t.equal scripts.map.four, "four.js"
      t.end()

    test 'sort', (t)->
      t.equal scripts.sorted[0], "one"
      t.equal scripts.sorted[1], "two"
      t.equal scripts.sorted[2], "three"
      t.equal scripts.sorted[3], "four"
      t.end()

    test 'output', (t)->
      t.equal scripts.output[0], "one.js"
      t.equal scripts.output[1], "two.js"
      t.equal scripts.output[2], "three.js"
      t.equal scripts.output[3], "four.js"
      t.end()

    test 'writeMap', (t)->
      depends.writeMap __dirname, "#{__dirname}/map.js", (err) ->
        t.ok not err?, 'no writemap error'

        fs.readFile "#{__dirname}/map.js", (err, contents) ->
          t.ok not err?, 'file was written'

          fs.unlink "#{__dirname}/map.js", -> t.end()

    t.end()
