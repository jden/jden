require('polyfill-promise')()
var app
var fs = require('pr/fs')
var path = require('pr/path')
var ejs = require('ejs')
var exec = require('pr/child_process').exec


module.exports = function () {
  app = this
  console.log('let\'s make a module for work!')
  interrogate()
  .then(format)
  .then(prepareFiles)
  .then(function (mod) {
    return Promise.all([
      installDevModules(mod),
      makeLocalRepo(mod),
      makeRemoteRepo(mod)
    ])
  })
  .then(function () {
    console.log('ALL DONEZO')
    process.exit()
  }, function (x) { console.error(x.stack) })
}

function interrogate(){
  return new Promise(function (resolve) {
    app.prompt('name: ', function (name) {
      app.prompt('description: ', function (description) {
        app.prompt('keywords: ', function (keywords) {
            resolve({
              name: name,
              description: description,
              keywords: keywords,
              private: false
            })
        })
      })
    })
  })
}

function format(mod) {
  mod.keywords = mod.keywords.split(',').map(function (x) { return x.trim() })
  mod.nameCamel = mod.name.replace(/-\w/g, function (name) { return name[1].toUpperCase()})
  mod.keywordsJson = mod.keywords.map(function (k) { return '"'+k+'"'}).join(', ').substr(1).replace(/"$/,'')
  mod.repo = 'git@github.com:agilemd/' + mod.name + '.git'
  mod.private = mod.private.toLowerCase() === 'y'
  return mod
}

function prepareFiles(mod) {
  mod.src = path.resolve(__dirname, './new/work')
  mod.dest = path.resolve(process.cwd(), mod.name)

  return fs.mkdir(mod.dest).then(function () {
    return Promise.all([
      schlep('/README.md'),
      mod.private ? Promise.resolve() : schlep('/LICENSE.md'),
      schlep('/.gitignore'),
      schlep('/package.json'),
      schlep('/index.js'),
      fs.mkdir(mod.dest + '/test').then(function () {
        return schlep('/test/test.js')
      })
    ])
  })
  .then(function () {
    console.log('files done!')
    return mod
  })


  function schlep(file) {
    console.log('schlepping', file)
    return fs.readFile(mod.src + undot(file), {encoding: 'utf8'}).then(zap).then(function (data) {
      console.log('writing', file)
      return fs.writeFile(mod.dest + file, data)
    })
  }

  function undot(file) {
    return file.replace(/\/\./,'/DOT')
  }

  function zap(template) {
    return ejs.render(template.toString(), mod)
  }
}

function installDevModules(mod) {
  console.log('installing dev modules')
  return exec('npm install', {cwd: mod.dest}).then(function (out) {
    console.log('done installing dev modules')
    return mod
  })
}

function makeLocalRepo(mod) {
  return execs(mod.dest, [
    'git init',
    'git remote add origin ' + mod.repo,
    'git add -A',
    'git commit -am "initialize ' + mod.name + '"'
  ])
}

function makeRemoteRepo(mod) {
  console.log('remote repo making not yet implemented')
  console.log('remember to go do that')
}

function execs(cwd, cmds) {
  cmds.reduce(function (q, cmd) {
    return q.then(function () {
      return exec(cmd, {cwd: cwd}).then(function (out) {
        console.log(out.stdout)
      })
    })
  }, Promise.resolve())
}