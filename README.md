# Depends

Stop JavaScript dependancy accidents today.

## Install

To get the most recent version of depends, I recommend installing it from GitHub.

    npm -g install git://github.com/defrex/js-depends.git


The latest verion in NPM is 0.3.1, 6924fa80b9292fc48a7d64aa2a752998c42f60ba, which is a little out of date.

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

Once that is in place, you'll need to run `depends` over your js directory.

    depends ./jsDirectory

This will output the list of js files, sorted to resolve all the dependencies. You can do with that what you will.

In development I generally shell out to `depends` and wrap the output in `<script>` tags before stuffing it in my base html template. For production the output can be piped into some other post-processor, like uglify. For example,

    depends -i ./jsDirectory | xargs uglifyjs > min.js

## Client-side

`client/depends.js` is a small client side lib. It provides definitions for `dep.require` and `dep.provide` at runtime.

`dep.provide` will ensure that the namespace exists, non-destructively assigning all the values (split by `.`) in the chain to `{}`.

`dep.require` will throw a warning if you're requiring something that isn't loaded. Normally this would never happen.

Alternately, put this noop somewhere before loading your code,

    window.dep = {require: function(){}, provide: function(){}};

## Node.js lib

depends is also usable as a node.js library.

    var depends = require('depends');

    depends.manage(directory, function(error, files){
      files.map // object {module: filename}
      files.sorted // array [module, module..] in dep order
      files.output // array [filename, filename..] in dep order
    });


## Development

Build the client,

    ./node_modules/.bin/coffee -cbp src/client.coffee > client/depends.js
    ./node_modules/.bin/uglifyjs client/depends.js > client/depends.min.js

Run the tests,

    ./node_modules/.bin/mocha --compilers coffee:coffee-script
