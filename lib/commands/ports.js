var findPorts = require('node-firefox-find-ports');

module.exports = function (program, init) {
  program.command('ports')
    .description('List ports of listening runtimes')
    .action(init(cmd));
};

function cmd (options) {
  findPorts().then(function (results) {
    results.forEach(function (result) {
      console.log(result.port, result.type, result.pid || result.deviceId);
    });
  }).catch(function (err) {
    console.error(err);
  });
}
