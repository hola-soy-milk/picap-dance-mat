var spawn = require('cross-spawn');
var MPR121 = require('node-picap');
var mpr121;

mpr121.setTouchThreshold(40);
mpr121.setReleaseThreshold(20);

var p1Left = 4;
var p1Right = 5;
var p1Up = 6;
var p1Down = 7;

var p7Left = 8;
var p7Right = 9;
var p7Up = 10;
var p7Down = 11;

var start = 12;
var back = 13;
// correct address for the Pi Cap - other boards may vary
mpr121 = new MPR121('0x5C');

mpr121.on('data', function(data) {
  var keys = [];
  data.forEach(function(electrode, i) {
    if (electrode.isNewTouch) {
      spawn.sync('echo -ne "\\0\\0\\4\\0\\0\\0\\0\\0" > /dev/hidg0', [], { stdio: 'inherit' });
    }
  });
});

process.on('SIGINT', function () {
  process.exit(0);
});
