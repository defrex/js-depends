
depends = require '../depends'
fs = require 'fs'
assert = require 'assert'

depends.manage "#{__dirname}/scripts/", (err, scripts) ->
  if err
    console.log err
    process.exit()

  assert.equal scripts.map.one, "#{__dirname}/scripts/one.js"
  assert.equal scripts.map.two, "#{__dirname}/scripts/two.js"
  assert.equal scripts.map.three, "#{__dirname}/scripts/three.js"
  assert.equal scripts.map.four, "#{__dirname}/scripts/four.js"
  console.log 'map correct'

  assert.equal scripts.sorted[0], "#{__dirname}/scripts/one.js"
  assert.equal scripts.sorted[1], "#{__dirname}/scripts/two.js"
  assert.equal scripts.sorted[2], "#{__dirname}/scripts/three.js"
  assert.equal scripts.sorted[3], "#{__dirname}/scripts/four.js"
  console.log 'sorted correctly'

depends.writeMap "#{__dirname}/scripts/", "#{__dirname}/map.js", (err) ->
  if err
    console.log err
    process.exit()

  fs.readFile "#{__dirname}/map.js", (err, contents) ->
    assert.ok not err?
    console.log 'no error on writeMap'

