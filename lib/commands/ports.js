var firefox = require('node-firefox');
var common = require('../common');

module.exports = function(program, init) {
  program.command('ports')
    .description('List ports of listening runtimes')
    .action(init(cmd));
};

function cmd(options) {
  return firefox.findPorts().then(function(results) {

    common.handleOutputOptions(results, options, function () {

      console.log(results.length + ' port(s) detected:');

      results.forEach(function(result) {
        var target;
        if (result.type == 'b2g') {
          target = 'simulator, PID = ' + result.pid;
        } else if (result.type == 'device') {
          target = 'device, ID = ' + result.deviceId;
        } else {
          // TODO: Not sure what other types there'll be. Android?
          target = result.type;
        }
        console.log('  ', result.port, ' -> ', target);
      });

    });

  });
}
