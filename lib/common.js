var findPorts = require('node-firefox-find-ports');

module.exports = {

  intList: function(val) {
    return val.split(',').map(function(item) {
      return parseInt(item);
    });
  },

  selectPorts: function (ports) {
    return findPorts().then(function(availablePorts) {
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
  }

};
