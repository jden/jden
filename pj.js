var fs = require('fs')
module.exports = function (name, desc) {
  app = this
  var file = process.cwd() + '/package.json'
  if (fs.existsSync(file)) {
    console.error('package.json already exists')
    return
  }
  console.log('package json time? let\'s do this!')
  var pj = {
    "name": name || "INVALID NAMEEEEEE",
    "author": "jden <jason@denizac.org>",
    "version": "0.1.0",
    "description": desc || "silly jden forgot to add a description",
    "keywords": [],
    "main": "index.js",
    "scripts": {
      "test": "node node_modules/mocha/bin/mocha"
    },
    "repository": "git@github.com:jden/"+name+".git",
    "license": "MIT",
    "readmeFilename": "README.md"
  }
  fs.writeFileSync(process.cwd() + '/package.json', JSON.stringify(pj, null, 2))
}