var firefox = require('node-firefox');

var common = module.exports = {

  dumpJSON: function(data, options) {
    console.dir(data, {
      depth: null,
      colors: !options.parent.nocolors
    });
  },

  handleOutputOptions: function(data, options, handler) {
    if (options.parent.quiet) {
      return;
    } else if (options.parent.json) {
      return common.dumpJSON(data, options);
    } else {
      return handler();
    }
  },

  intList: function(val) {
    return val.split(',').map(function(item) {
      return parseInt(item);
    });
  },

  selectPorts: function(ports) {
    return firefox.findPorts().then(function(availablePorts) {
      var selectedPorts;
      if (!ports || ports.length === 0) {
        // By default, install to all available ports.
        selectedPorts = availablePorts;
      } else {
        // Filter available ports by --ports option.
        selectedPorts = availablePorts.filter(function(port) {
          return options.ports.indexOf(port.port) !== -1;
        });
      }
      return selectedPorts;
    });
  },

  uninstall: function(client, manifest) {
    return firefox.findApp({
      client: client,
      manifest: manifest
    }).then(function(apps) {
      return Promise.all(apps.map(function(app) {
        return firefox.uninstallApp({
          client: client,
          manifestURL: app.manifestURL
        });
      }));
    });
  },

  launch: function(client, manifest, appId) {
    return firefox.findApp({
      client: client,
      manifest: manifest
    }).then(function(apps) {
      return Promise.all(apps.filter(function (app) {
        return (!appId) || app.id == appId;
      }).map(function (app) {
        return firefox.launchApp({
          client: client,
          manifestURL: app.manifestURL
        });
      }));
    });
  }

};
