var Promise = require('promise')
var all = require('Q').all
var app
var fs = require('pr/fs')
var path = require('pr/path')
var ejs = require('ejs')
var exec = require('pr/child_process').exec
var Q = require('Q')


module.exports = function () {
  app = this
  console.log('let\'s make a module!')
  interrogate()
  .then(format)
  .then(prepareFiles)
  .then(function (mod) {
    return all([
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
  // return Promise(function (resolve) {
  //   resolve({name: 'foo', description: 'bar', keywords: 'baz,qux'})
  // })
  return Promise(function (resolve) {
    app.prompt('name: ', function (name) {
      app.prompt('description: ', function (description) {
        app.prompt('keywords: ', function (keywords) {
          resolve({
            name: name,
            description: description,
            keywords: keywords
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
  mod.repo = 'git@github.com:jden/' + mod.name + '.git'
  return mod
}

function prepareFiles(mod) {
  mod.src = path.resolve(__dirname, './new/me')
  mod.dest = path.resolve(process.cwd(), mod.name)

  return fs.mkdir(mod.dest).then(function () {
    return all([
      schlep('/README.md'),
      schlep('/LICENSE.md'),
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
  }, Q())
}