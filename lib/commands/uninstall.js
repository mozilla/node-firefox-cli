var firefox = require('node-firefox');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var common = require('../common');

module.exports = function(program, init) {
  program.command('uninstall <appPath>')
    .description('uninstall a webapp')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .option('-i, --appid <appId>', 'specify the installed app ID')
    .action(init(cmd));
};

function cmd(appPath, options) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));

  return common.selectPorts(options.ports).then(function (selectedPorts) {

    if (selectedPorts.length === 0) {
      throw new Error('No ports available for uninstall');
    }

    return Promise.all(selectedPorts.map(function(port) {
      var client, uninstallResult;
      return firefox.connect(port.port).then(function (result) {
        client = result;
        return common.uninstall(client, manifest, options.appid);
      }).then(function (result) {
        uninstallResult = result;
        return client.disconnect();
      }).then(function () {
        return {
          port: port,
          uninstalled: uninstallResult
        };
      });
    }));

  }).then(function(results) {

    // Filter out ports where no uninstalls happened.
    results = results.filter(function (result) {
      return result.uninstalled.length > 0;
    });

    common.handleOutputOptions(results, options, function () {
      console.log('App uninstalled from ' + results.length + ' runtime(s):');
      results.forEach(function (result) {
        console.log('  ', common.formatPort(result.port));
      });
    });

  });

}
