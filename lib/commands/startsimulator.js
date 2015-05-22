var firefox = require('node-firefox');
var common = require('../common');
var _ = require('lodash');

module.exports = function(program, init) {
  program.command('startsimulator [versions...]')
    .description('Start a simulator')
    .option('-d, --detached', 'launch simulator as a background process')
    .option('-p, --port <port>', 'specify debugging port for simulator')
    .option('-t, --timeout <timeout>',
        'time (in ms) to wait for simulator to launch (default: 25000)')
    .action(init(cmd));
};

function cmd(versions, options) {

  var simulatorOptions = {
    verbose: options.parent.verbose,
    detached: options.detached,
    port: options.port,
    timeout: options.timeout
  };

  return firefox.findSimulators().then(function(availableSimulators) {

    var simulatorsToLaunch;
    if (versions.length === 0) {
      simulatorsToLaunch = [availableSimulators.pop()];
    } else {
      simulatorsToLaunch = availableSimulators.filter(function(simulator) {
        return versions.indexOf(simulator.version) !== -1;
      });
    }

    return simulatorsToLaunch;

  }).then(firefox.startSimulator.all(simulatorOptions)).then(function(results) {

    common.handleOutputOptions(results, options, function () {
      console.log('Started ' + results.length + ' simulator(s):');
      results.forEach(function(result) {
        console.log('  port ' + result.port + ', PID = ' + result.pid +
          ', ' + result.binary);
      });
    });

  });

}
