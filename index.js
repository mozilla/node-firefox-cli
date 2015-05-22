var program = require('commander');
var requireDir = require('require-dir');
var package = require(__dirname + '/package.json');

program.version(package.version)
  .option('-D, --debug', 'enable debugging and debug output')
  .option('-q, --quiet', 'quiet output, except for errors')
  .option('-v, --verbose', 'verbose output')
  .option('-j, --json', 'JSON data output')
  .option('--nocolors', 'no ANSI colors in JSON output');

// Common command init wrapper with error reporting.
function init (cmd) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    cmd.apply(program, args)
      .catch(function (err) {
        console.error(err);
        process.exit(1);
      });
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
