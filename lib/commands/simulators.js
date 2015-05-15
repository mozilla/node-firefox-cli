var firefox = require('node-firefox');
var _ = require('lodash');

module.exports = function(program, init) {
  program.command('simulators')
    .description('List available simulators')
    .action(init(cmd));
};

function cmd(options) {
  firefox.findSimulators().then(function(results) {
    if (options.parent.verbose) {
      // On verbose option, output the complete results
      console.log(results);
    } else {
      // List just the unique simulator versions available
      _(results).pluck('version').uniq().forEach(function(version) {
        console.log(version);
      }).value();
    }
  }).catch(console.error);
}
