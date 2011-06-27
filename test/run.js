var assert, depends, fs, static;
depends = require('../lib/depends');
fs = require('fs');
assert = require('assert');
static = require('../lib/simpleStatic');
depends.manage(__dirname, function(err, scripts) {
  if (err) {
    console.log(err);
    process.exit();
  }
  assert.equal(scripts.map.one, "/scripts/one.js");
  assert.equal(scripts.map.two, "/scripts/two.js");
  assert.equal(scripts.map.three, "/scripts/three.js");
  assert.equal(scripts.map.four, "/scripts/four.js");
  console.log('map correct');
  assert.equal(scripts.sorted[0], "" + __dirname + "/scripts/one.js");
  assert.equal(scripts.sorted[1], "" + __dirname + "/scripts/two.js");
  assert.equal(scripts.sorted[2], "" + __dirname + "/scripts/three.js");
  assert.equal(scripts.sorted[3], "" + __dirname + "/scripts/four.js");
  console.log('sorted correctly');
  assert.equal(scripts.output[0], "/scripts/one.js");
  assert.equal(scripts.output[1], "/scripts/two.js");
  assert.equal(scripts.output[2], "/scripts/three.js");
  assert.equal(scripts.output[3], "/scripts/four.js");
  console.log('output correctly');
  return depends.writeMap(__dirname, "" + __dirname + "/map.js", function(err) {
    if (err) {
      console.log(err);
      process.exit();
    }
    return fs.readFile("" + __dirname + "/map.js", function(err, contents) {
      assert.ok(!(err != null));
      console.log('no error on writeMap');
      static.run(__dirname, '127.0.0.1', 3003);
      return console.log('complete test at: http://127.0.0.1:3003/test.html');
    });
  });
});