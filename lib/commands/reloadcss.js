'use strict';

var firefox = require('node-firefox');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var common = require('../common');

module.exports = function(program, init) {
  program.command('reloadcss <appPath>')
    .description('reload CSS for a webapp')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .option('-i, --appid <appId>', 'specify the installed app ID')
    .action(init(command));
};

function command(appPath, options) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));

  return common.selectPorts(options.ports).then(function (selectedPorts) {

    if (selectedPorts.length === 0) {
      throw new Error('No ports available for reloadcss');
    }

    return Promise.all(selectedPorts.map(function(port) {
      var client, reloadResult;
      return firefox.connect(port.port).then(function (result) {
        client = result;
        return common.reloadCss(client, appPath, manifest, options.appid);
      }).then(function (result) {
        reloadResult = result;
        return client.disconnect();
      }).then(function () {
        return {
          port: port,
          reloaded: reloadResult
        };
      });
    }));

  }).then(function(results) {

    // Filter out ports where no reloadcsss happened.
    results = results.filter(function (result) {
      return result.reloaded.length > 0;
    });

    common.handleOutputOptions(results, options, function () {
      console.log('CSS reloaded for ' + results.length + ' runtime(s):');
      results.forEach(function (result) {
        console.log('  ', common.formatPort(result.port));
      });
    });

  });

}
