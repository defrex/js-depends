
# Depends

Stop JavaScript dependancy accidents today.

## Usage

At the top of a given js file, you can put `dep.provide` and `dep.require`. The name passed into these function can be whatever you want. Module names makes sense.

    dep.provide('lib1');

    window.lib1 = 'awesome';

. . .

    dep.require('lib1');

    dep.provide('lib2');

    window.lib1 == 'awesome';

This style is largely inspired to Google Closure's goog.provide and goog.require, only without the overhead of the rest of the library.

Once that is in place, you'll need to load your js in order. This can be done in a few ways.

    depends --loader=mydepends.js

This will search the current directory recursively looking for `.js` files that inclide `dep.provide` or `dep.require`. It will then create a file called mydepends.js. This file contains the code, as well as the mapping from module names to filenames needed to load the files at runtime.

    <script src="mydepends.js"></script>

Including this one file will include _all_ your javascript, in order.

Clearly this solution isn't production-worthy, since it downloads each js fime individually. For that reason you can run `depends` without the `--loader` flag, and it will simply print all the file names in order. The assumption being one can take the output and incorperate it into thier own build system.

## Node.js lib

depends is also usable as a node.js library. There are two operations: `manage` and `writeMap`.

    var depends = require('depends')

    depends.manage(directory, function(error, files){
      files.map // object {module: filename}
      files.sorted // array [module, module..] in dep order
      files.output // array [filename, filename..] in dep order
    });

    depends.writeMap(directory, outputFilename, function(error){

    });
