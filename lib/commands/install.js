var firefox = require('node-firefox');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var common = require('../common');

module.exports = function(program, init) {
  program.command('install <appPath>')
    .description('Install a webapp')
    .option('-n, --nodelete',
        'do not delete existing apps before installation')
    .option('-l, --launch',
        'launch app after installation')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .action(init(cmd));
};

function cmd(appPath, options) {

  return common.selectPorts(options.ports).then(function (selectedPorts) {
    if (selectedPorts.length === 0) {
      throw new Error('No ports available for install');
    }
    return Promise.all(selectedPorts.map(function(port) {
      return install(options, port, appPath);
    }));
  }).then(function(results) {

    common.handleOutputOptions(results, options, function () {

      console.log('Installed app on ' + results.length + ' runtime(s):');

      results.forEach(function(result) {
        console.log('  App ID', result.appId, '->',
          common.formatPort(result.port));
      });

    });

  });

}

function install(options, port, appPath) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));
  var client, appId;
  return firefox.connect(port.port).then(function(result) {
    client = result;
    return options.nodelete ? false : common.uninstall(client, manifest);
  }).then(function(result) {
    return firefox.installApp({ client: client, appPath: appPath });
  }).then(function(result) {
    appId = result;
    return options.launch ? common.launch(client, manifest, appId) : false;
  }).then(function(result) {
    return client.disconnect();
  }).then(function(result) {
    return { port: port, appId: appId };
  });
}
