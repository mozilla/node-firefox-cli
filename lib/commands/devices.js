'use strict';

var firefox = require('node-firefox');
var common = require('../common');

module.exports = function(program, init) {
  program.command('devices')
    .description('List connected devices')
    .action(init(command));
};

function command(options) {
  return firefox.findDevices().then(function(results) {
    common.handleOutputOptions(results, options, function () {

      console.log(results.length + ' device(s) detected:');

      results.forEach(function(device) {
        console.log('  ', device.id);
      });

    });
  });
}
