var assert, depends, fs;
depends = require('../depends');
fs = require('fs');
assert = require('assert');
depends.manage("" + __dirname + "/scripts/", function(err, scripts) {
  if (err) {
    console.log(err);
    process.exit();
  }
  assert.equal(scripts.map.one, "" + __dirname + "/scripts/one.js");
  assert.equal(scripts.map.two, "" + __dirname + "/scripts/two.js");
  assert.equal(scripts.map.three, "" + __dirname + "/scripts/three.js");
  assert.equal(scripts.map.four, "" + __dirname + "/scripts/four.js");
  console.log('map correct');
  assert.equal(scripts.sorted[0], "" + __dirname + "/scripts/one.js");
  assert.equal(scripts.sorted[1], "" + __dirname + "/scripts/two.js");
  assert.equal(scripts.sorted[2], "" + __dirname + "/scripts/three.js");
  assert.equal(scripts.sorted[3], "" + __dirname + "/scripts/four.js");
  return console.log('sorted correctly');
});
depends.writeMap("" + __dirname + "/scripts/", "" + __dirname + "/map.js", function(err) {
  if (err) {
    console.log(err);
    process.exit();
  }
  return fs.readFile("" + __dirname + "/map.js", function(err, contents) {
    assert.ok(!(err != null));
    return console.log('no error on writeMap');
  });
});