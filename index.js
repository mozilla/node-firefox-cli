var program = require('commander');
var requireDir = require('require-dir');
var package = require(__dirname + '/package.json');

program.version(package.version)
  .option('-D, --debug', 'enable debugging and debug output')
  .option('-q, --quiet', 'quiet output, except for errors')
  .option('-v, --verbose', 'enable verbose output');

function init (next) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    next.apply(program, args);
  }
}

var cmds = requireDir('./lib/commands');
for (name in cmds) {
  cmds[name](program, init);
}

module.exports = function () {
  program.parse(process.argv);
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
  }
};
