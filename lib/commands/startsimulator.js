var _ = require('lodash');
var startSimulator = require('node-firefox-start-simulator');
var findSimulators = require('node-firefox-find-simulators');

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

  findSimulators().then(function(availableSimulators) {

    var simulatorsToLaunch;
    if (versions.length === 0) {
      simulatorsToLaunch = [availableSimulators.pop()];
    } else {
      simulatorsToLaunch = availableSimulators.filter(function(simulator) {
        return versions.indexOf(simulator.version) !== -1;
      });
    }

    return simulatorsToLaunch;

  }).then(startSimulator.all(simulatorOptions)).then(function(results) {

    if (options.parent.verbose) {
      console.log(results);
    } else if (!options.parent.quiet) {
      results.forEach(function(result) {
        console.log(result.port, result.pid, result.binary);
      });
    }

  }).catch(console.error);

}
