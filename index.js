#! /usr/local/bin/node

var jden = require('commander')
var package = require('./package.json')

jden.version(package.version)

jden.command('new')
  .description('create a new module project')
  .action(require('./new').bind(jden))

jden.command('*')
  .action(function () {
    console.log('hi!')
  })


jden.parse(process.argv)

if (!jden.args.length) {
  jden.help()
}