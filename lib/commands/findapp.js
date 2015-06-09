var fs = require('fs');
var common = require('../common');
var firefox = require('node-firefox');

module.exports = function(program, init) {
  program.command('findapp <appPath>')
    .description('Find installations of a webapp')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .action(init(command));
};

function command(appPath, options) {
  return common.selectPorts(options.ports).then(function (selectedPorts) {
    if (selectedPorts.length === 0) {
      throw new Error('No ports available for listing apps');
    }
    return Promise.all(selectedPorts.map(function(port) {
      return listApps(options, port, appPath);
    }));
  }).then(function(results) {

    common.handleOutputOptions(results, options, function () {

      console.log(results.length + ' apps found:');

      results.forEach(function (result) {
        var port = result[0];
        var apps = result[1];
        apps.forEach(function (app) {
          console.log('  Installed on port', port.port, 'as', app.manifestURL);
        });
      });

    });

  });
}

function listApps(options, port, appPath) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));
  var client, apps;
  return firefox.connect(port.port).then(function(result) {
    client = result;
    return firefox.findApp({ client: client, manifest: manifest });
  }).then(function(result) {
    apps = result;
    return client.disconnect();
  }).then(function(result) {
    return [port, apps];
  });
}
