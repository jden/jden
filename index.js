#!/usr/bin/env node

var jden = ax(require('commander'))

var package = require('./package.json')
jden.version(package.version)

jden.command('new')
  .description('create a new module project')
  .action('new')

jden.command('work')
  .description('create a new module project for work')
  .action('work')

jden.command('pj [name] [desc]')
  .description('make a new package.json file in the current directory')
  .action('pj')

jden.command('*')
  .action(function () {
    console.log('hi!')
  })

jden.parse(process.argv)

if (!jden.args.length) {
  jden.help()
}


function ax(cmdr) {
  var _action = cmdr.Command.prototype.action
  cmdr.Command.prototype.action = function (module) {
    if (typeof module === 'string') {
      _action.call(this, require('./' + module).bind(cmdr))
    } else {
      _action.call(this, module)
    }
    return cmdr
  }
  return cmdr
}