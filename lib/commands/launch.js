'use strict';

var firefox = require('node-firefox');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var common = require('../common');

module.exports = function(program, init) {
  program.command('launch <appPath>')
    .description('launch a webapp')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .option('-i, --appid <appId>', 'specify the installed app ID')
    .action(init(command));
};

function command(appPath, options) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));

  return common.selectPorts(options.ports).then(function (selectedPorts) {

    if (selectedPorts.length === 0) {
      throw new Error('No ports available for launch');
    }

    return Promise.all(selectedPorts.map(function(port) {
      var client, launchResult;
      return firefox.connect(port.port).then(function (result) {
        client = result;
        return common.launch(client, manifest, options.appid);
      }).then(function (result) {
        launchResult = result;
        return client.disconnect();
      }).then(function () {
        return {
          port: port,
          launched: launchResult
        };
      });
    }));

  }).then(function(results) {

    // Filter out ports where no launches happened.
    results = results.filter(function (result) {
      return result.launched.length > 0;
    });

    common.handleOutputOptions(results, options, function () {
      console.log('App launched on ' + results.length + ' runtime(s):');
      results.forEach(function (result) {
        console.log('  ', common.formatPort(result.port));
      });
    });

  });

}
