
# Depends

Stop JavaScript dependancy accidents today.

## Install

    npm -g install depends

## Usage

At the top of a given js file, you can put `dep.provide` and `dep.require`. The names (strings) passed into these functions can be whatever you want. Module names makes sense.

    dep.provide('lib1');

    window.lib1 = 'awesome';

. . .

    dep.require('lib1');
    dep.provide('lib2');

    if (window.lib1 != 'awesome') throw('a fit')

. . .

    dep.require('lib1');
    dep.require('lib2');

    if (window.lib1 != 'awesome') throw('a fit')

This style is largely inspired to Google Closure's `goog.provide` and `goog.require`, only without the investment of using Closure Library.

Once that is in place, you'll need to run `depends` over your js directory to generate a loader file.

    depends --loader=mydepends.js --src=./js/

This will search the current directory recursively looking for `.js` files that inclide `dep.provide` or `dep.require`. It will then create a file called mydepends.js (in this example). This file will load all of your js, in order, at runtime.

    <script src="mydepends.js"></script>

Including this one file will include _all_ your javascript, in order. If this is not what you want use:

    depends --map=mydepends.js --src=./js/

This will just include the map, but not load the js. After that any `dep.require` statements will cause the js to load syncronously.

Clearly this solution isn't production-worthy, since it downloads each js file individually. For that reason you can run `depends` without the `--loader` or `--map` flags, and it will simply print all the file names in order. The assumption being one can take the output and incorperate it into thier own build system.

If you can think of a more convinient way to handle production, let me know and I'll see what I can do.

## Node.js lib

depends is also usable as a node.js library. There are three operations: `manage`, `writeMap` and `writeLoader`.

    var depends = require('depends');

    depends.manage(directory, function(error, files){
      files.map // object {module: filename}
      files.sorted // array [module, module..] in dep order
      files.output // array [filename, filename..] in dep order

      files.writeClient(filename, load, function(error){}); // (load=true) == writeLoader
    });

    depends.writeMap(directory, outputFilename, function(error){});
    depends.writeLoader(directory, outputFilename, function(error){});
