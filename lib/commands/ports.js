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
        console.log('  ', common.formatPort(result));
      });
    });
  });
}
