var findDevices = require('node-firefox-find-devices');

module.exports = function(program, init) {
  program.command('devices')
    .description('List connected devices')
    .action(init(cmd));
};

function cmd(options) {
  findDevices().then(function(result) {
    result.forEach(function(device) {
      console.log(device.id);
    });
  }).catch(console.error);
}
