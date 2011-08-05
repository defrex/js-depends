
vm = require 'vm'
fs = require 'fs'
request = require 'request'
_ = require('underscore')._


class NodeDep

  constructor: (@files, @options={})->
    this.context = options.context || {}
    this.context.dep = this
    this.loaded = {}


  require: (mod)->
    throw new Error 'Module not found: '+mod if not this.loaded[mod]


  provide: (mod)->
    split = mod.split('.')
    cur = this.context
    cur = cur[split.shift()] ||= {} while split.length
    this.loaded[mod] = true


  execute: (mod, clbk)->
    if not this.loaded[mod]
      mods = this.files.dependsOn mod

      for mod in mods
        file = this.files.rawMap[mod]
        content = this.files.js[file]
        vm.runInNewContext content, this.context, file

    clbk()


  dlIntoContext: (url, clbk)->
    request url: url, (err, res, body)=>
      return clbk err if err?

      vm.runInNewContext body, this.context, url
      clbk()


  inContext: (func)->
    funcStr = "(#{func.toString()})();"
    vm.runInNewContext funcStr, this.context, func.name+'InDepContext'


exports.NodeDep = NodeDep
