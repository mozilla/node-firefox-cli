var firefox = require('node-firefox');
var common = require('../common');
var _ = require('lodash');

module.exports = function(program, init) {
  program.command('simulators')
    .description('List available simulators')
    .action(init(command));
};

function command(options) {
  return firefox.findSimulators().then(function(results) {

    common.handleOutputOptions(results, options, function () {

      console.log(results.length + ' simulator(s) found:');

      _(results).groupBy('version').forEach(function (simulators, version) {
        console.log('  Version', version);
        simulators.forEach(function (simulator) {
          console.log('  ', simulator.bin);
        });
      }).value();

    });

  });
}
