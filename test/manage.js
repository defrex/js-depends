var depends, fs, test;
test = require('tap').test;
fs = require('fs');
depends = require('../lib/depends');
test('manage', function(t) {
  return depends.manage("" + __dirname + "/scripts/", function(err, scripts) {
    t.ok(!(err != null), 'no init error');
    test('map', function(t) {
      t.equal(scripts.map.one, "one.js");
      t.equal(scripts.map.two, "two.js");
      t.equal(scripts.map.three, "three.js");
      t.equal(scripts.map.four, "four.js");
      return t.end();
    });
    test('sort', function(t) {
      t.equal(scripts.sorted[0], "one");
      t.equal(scripts.sorted[1], "two");
      t.equal(scripts.sorted[2], "three");
      t.equal(scripts.sorted[3], "four");
      return t.end();
    });
    test('output', function(t) {
      t.equal(scripts.output[0], "one.js");
      t.equal(scripts.output[1], "two.js");
      t.equal(scripts.output[2], "three.js");
      t.equal(scripts.output[3], "four.js");
      return t.end();
    });
    test('writeMap', function(t) {
      return depends.writeMap(__dirname, "" + __dirname + "/map.js", function(err) {
        t.ok(!(err != null), 'no writemap error');
        return fs.readFile("" + __dirname + "/map.js", function(err, contents) {
          t.ok(!(err != null), 'file was written');
          return fs.unlink("" + __dirname + "/map.js", function() {
            return t.end();
          });
        });
      });
    });
    return t.end();
  });
});