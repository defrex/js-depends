
http = require 'http'
path = require 'path'
url = require 'url'
fs = require 'fs'

error = (err, res) ->
  res.writeHead 500

  res.write err.toString()
  res.end()

exports.run = (root, address, port) ->
  (http.createServer (req, res) ->
    filename = path.join root, url.parse(req.url).pathname

    if /client\.js$/.test(filename)
      filename = filename.replace 'client.js', '../client.js'

    path.exists filename, (exists) ->
      if not exists
        res.writeHead 404
        res.end()
        return

      fs.stat filename, (err, stat) ->
        return error err, res if err

        filename += 'index.html' if stat.isDirectory()

        fs.readFile filename, 'binary', (err, file) ->
          return error err, res if err

          res.writeHead 200
          res.write(file, 'binary');
          res.end();

  ).listen(port, address)
