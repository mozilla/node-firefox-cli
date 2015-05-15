var fs = require('fs');
var common = require('../common');
var findPorts = require('node-firefox-find-ports');
var connect = require('node-firefox-connect');
var findApp = require('node-firefox-find-app');

module.exports = function(program, init) {
  program.command('findapps <appPath>')
    .description('Find installations of an app')
    .option('-p, --ports <port, port, ...>',
        'specify debugging ports for runtimes', common.intList)
    .action(init(cmd));
};

function cmd(appPath, options) {
  common.selectPorts(options.ports).then(function (selectedPorts) {
    if (selectedPorts.length === 0) {
      throw new Error('No ports available for listing apps');
    }
    return Promise.all(selectedPorts.map(function(port) {
      return listApps(options, port, appPath);
    }));
  }).then(function(results) {

    if (!options.parent.quiet) {
      results.forEach(function (result) {
        var port = result[0];
        var apps = result[1];
        apps.forEach(function (app) {
          console.log('Installed on port', port.port, 'as', app.manifestURL);
        });
      });
    }

  }).catch(function(err) {
    console.error(err);
  });
}

function listApps(options, port, appPath) {
  var manifest = JSON.parse(fs.readFileSync(appPath + '/manifest.webapp'));
  var client, apps;
  return connect(port.port).then(function(result) {
    client = result;
    return findApp({ client: client, manifest: manifest });
  }).then(function(result) {
    apps = result;
    return client.disconnect();
  }).then(function(result) {
    return [port, apps];
  });
}
