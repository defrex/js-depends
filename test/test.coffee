
spawn = require('child_process').spawn
assert = require('assert')
path = require('path')


describe 'depends', ->

  it 'sorts files correctly', (done)->
    depends = require '../src/depends.coffee'
    depends.manage "#{__dirname}/scripts/", (err, scripts) ->
      throw err if err

      assert.equal scripts.map.one, "one.js"
      assert.equal scripts.map.two, "two.js"
      assert.equal scripts.map.three, "three.js"
      assert.equal scripts.map.four, "four.js"

      assert.equal scripts.sorted[0], "one"
      assert.equal scripts.sorted[1], "two"
      assert.equal scripts.sorted[2], "three"
      assert.equal scripts.sorted[3], "four"

      assert.equal scripts.output[0], "one.js"
      assert.equal scripts.output[1], "two.js"
      assert.equal scripts.output[2], "three.js"
      assert.equal scripts.output[3], "four.js"

      done()


  it 'works from the command line', (done)->

    depends = spawn path.normalize("#{__dirname}/../src/bin.js"), ["#{__dirname}/scripts/"]

    out = ''
    depends.stdout.on 'data', (data)-> out += data
    err = ''
    depends.stderr.on 'data', (data)-> err += data

    depends.on 'close', (code)->
      throw err if err
      assert.equal code, 0

      output = out.split('\n')
      assert.equal output[0], "one.js"
      assert.equal output[1], "two.js"
      assert.equal output[2], "three.js"
      assert.equal output[3], "four.js"

      done()
