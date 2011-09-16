
test = require('tap').test

depends = require '../lib/depends'

test 'NodeDep', (t)->

  depends.manage "#{__dirname}/scripts/", (err, files) ->
    t.ok not err?, 'no init error'

    context = window: {}, console: console

    dep = new depends.NodeDep files, context: context

    t.ok dep instanceof depends.NodeDep, 'NodeDep inst correct'

    dep.execute 'four', -> t.end()
