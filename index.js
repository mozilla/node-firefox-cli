var program = require('commander');
var requireDir = require('require-dir');
var package = require(__dirname + '/package.json');

program.version(package.version)
  .option('-D, --debug', 'enable debugging and debug output')
  .option('-q, --quiet', 'quiet output, except for errors')
  .option('-j, --json', 'JSON data output')
  .option('-v, --verbose', 'verbose output')
  .option('-nc, --nocolors', 'no ANSI colors in JSON output');

// Common command init wrapper with error reporting.
function init (cmd) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    cmd.apply(program, args)
      .catch(console.error);
  }
}

// Load up all the command modules.
var cmds = requireDir('./lib/commands');
for (name in cmds) {
  cmds[name](program, init);
}

// Export the CLI driver to bootstrap script
module.exports = function () {
  program.parse(process.argv);
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
  }
};
