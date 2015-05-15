var forwardPorts = require('node-firefox-forward-ports');
var findDevices = require('node-firefox-find-devices');
var Promise = require('es6-promise').Promise;

module.exports = function (program, init) {
  program.command('forwardports [deviceIDs...]')
    .description('Forward local ports to connected devices')
    .option('-A, --all', 'forward ports to all detected devices')
    .action(init(cmd));
};

function cmd (deviceIDs, options) {

  // Build a simple promise to start the chain from command params
  var getDevices = new Promise(function (resolve, reject) {
    return resolve(deviceIDs.map(function (id) {
      return { id: id };
    }));
  });

  // If --all is used, extend the getDevices promise chain with findDevices()
  if (options.all) {
    getDevices = getDevices.then(function (devices) {
      return Promise.all([ devices, findDevices() ]);
    }).then(function (result) {
      return result[0].concat(result[1]);
    });
  }

  // Finalize getting device list together, forward ports, output results.
  getDevices.then(function (devices) {
    return forwardPorts(devices);
  }).then(function (results) {
    results.forEach(function (result) {
      result.ports.forEach(function (port) {
        console.log(result.id, port.port);
      });
    });
  }).catch(function (err) {
    console.error(err);
  });

}
