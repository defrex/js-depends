
fs = require 'fs'
request = require 'request'
contextify = require 'contextify'
_ = require('underscore')._


class NodeDep

  constructor: (@files, @options={})->
    this.context = options?.context || {}

    if not (this.context.getGlobal? and this.context.run? and this.context.dispose?)
      this.context = contextify this.context

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
        this.context.run content, file

    clbk?()


  dlIntoContext: (url, clbk)->
    console.log url
    request url: url, (err, res, body)=>
      return clbk err if err?

      try
        this.context.run body, url
      catch e
        console.log 'error in file: ', url
        console.log e.stack

      clbk()


  inContext: (func)->
    funcStr = "(#{func.toString()})();"
    this.context.run funcStr, func.name+'InDepContext'


exports.NodeDep = NodeDep
