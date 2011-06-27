
depends = require '../lib/depends'
fs = require 'fs'
assert = require 'assert'
static = require '../lib/simpleStatic'

depends.manage __dirname, (err, scripts) ->
  if err
    console.log err
    process.exit()

  assert.equal scripts.map.one, "/scripts/one.js"
  assert.equal scripts.map.two, "/scripts/two.js"
  assert.equal scripts.map.three, "/scripts/three.js"
  assert.equal scripts.map.four, "/scripts/four.js"
  console.log 'map correct'

  assert.equal scripts.sorted[0], "one"
  assert.equal scripts.sorted[1], "two"
  assert.equal scripts.sorted[2], "three"
  assert.equal scripts.sorted[3], "four"
  console.log 'sorted correctly'

  assert.equal scripts.output[0], "/scripts/one.js"
  assert.equal scripts.output[1], "/scripts/two.js"
  assert.equal scripts.output[2], "/scripts/three.js"
  assert.equal scripts.output[3], "/scripts/four.js"
  console.log 'output correctly'

  depends.writeLoader __dirname, "#{__dirname}/map.js", (err) ->
    if err
      console.log err
      process.exit()

    fs.readFile "#{__dirname}/map.js", (err, contents) ->
      assert.ok not err?
      console.log 'no error on writeLoader'

      static.run __dirname, '127.0.0.1', 3003

      console.log 'complete test at: http://127.0.0.1:3003/test.html'
