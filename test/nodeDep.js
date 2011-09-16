var depends, test;
test = require('tap').test;
depends = require('../lib/depends');
test('NodeDep', function(t) {
  return depends.manage("" + __dirname + "/scripts/", function(err, files) {
    var context, dep;
    t.ok(!(err != null), 'no init error');
    context = {
      window: {},
      console: console
    };
    dep = new depends.NodeDep(files, {
      context: context
    });
    t.ok(dep instanceof depends.NodeDep, 'NodeDep inst correct');
    return dep.execute('four', function() {
      return t.end();
    });
  });
});