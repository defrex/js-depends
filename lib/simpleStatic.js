(function() {
  var error, fs, http, path, url;
  http = require('http');
  path = require('path');
  url = require('url');
  fs = require('fs');
  error = function(err, res) {
    res.writeHead(500);
    res.write(err.toString());
    return res.end();
  };
  exports.run = function(root, address, port) {
    return (http.createServer(function(req, res) {
      var filename;
      filename = path.join(root, url.parse(req.url).pathname);
      return path.exists(filename, function(exists) {
        if (!exists) {
          res.writeHead(404);
          res.end();
          return;
        }
        return fs.stat(filename, function(err, stat) {
          if (err) {
            return error(err, res);
          }
          if (stat.isDirectory()) {
            filename += 'index.html';
          }
          return fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
              return error(err, res);
            }
            res.writeHead(200);
            res.write(file, 'binary');
            return res.end();
          });
        });
      });
    })).listen(port, address);
  };
}).call(this);
