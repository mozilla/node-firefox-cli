var firefox = require('node-firefox');
var common = require('../common');
var Promise = require('es6-promise').Promise;

module.exports = function(program, init) {
  program.command('forwardports [deviceIDs...]')
    .description('Forward local ports to connected devices')
    .action(init(cmd));
};

function cmd(deviceIDs, options) {

  // Build a simple promise to start the chain from command params
  var getDevices = new Promise(function(resolve, reject) {
    return resolve(deviceIDs.map(function(id) {
      return { id: id };
    }));
  });

  // If no devices supplied, then just forward whatever we can find.
  if (deviceIDs.length === 0) {
    getDevices = getDevices.then(function(devices) {
      return Promise.all([ devices, firefox.findDevices() ]);
    }).then(function(result) {
      return result[0].concat(result[1]);
    });
  }

  // Finalize getting device list together, forward ports, output results.
  return getDevices.then(function(devices) {
    return firefox.forwardPorts(devices);
  }).then(function(results) {

    common.handleOutputOptions(results, options, function () {

      console.log('Ports forwarded to ' + results.length + ' device(s):');

      results.forEach(function(device) {
        console.log('  ' + device.id);
        device.ports.forEach(function (port) {
          console.log('    ' + port.port + ' -> ' + port.remote);
        });
      });

    });

  });

}
