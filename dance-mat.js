var spawn = require('child_process');
var MPR121 = require('node-picap');
var mpr121;

var p1Left = 4;
var p1Right = 5;
var p1Up = 6;
var p1Down = 7;

var p2Left = 8;
var p2Right = 9;
var p2Up = 10;
var p2Down = 11;

var p1Start = 12;
var p1Back = 13;
// correct address for the Pi Cap - other boards may vary
mpr121 = new MPR121('0x5C');
mpr121.setTouchThreshold(40);
mpr121.setReleaseThreshold(20);

mpr121.on('data', function(data) {
  var keys = [];
  data.forEach(function(electrode, i) {
    if (electrode.isNewTouch) {
      switch(i) {
        case 0:
          keys.push(p1Left);
          break;
        case 1:
          keys.push(p1Right);
          break;
        case 2:
          keys.push(p1Up);
          break;
        case 3:
          keys.push(p1Down);
          break;
        case 4:
          keys.push(p2Left);
          break;
        case 5:
          keys.push(p2Right);
          break;
        case 6:
          keys.push(p2Up);
          break;
        case 7:
          keys.push(p2Down);
          break;
        case 8:
          keys.push(p2Up);
          break;
        case 9:
          keys.push(p1Start);
          break;
        case 10:
          keys.push(p1Back);
          break;
      }
    }
  });
  keystroke = "\\0\\0";
  keys.forEach(function(key) {
    keystroke += "\\" + key;
  });
  while(keystroke.length < 16) {
    keystroke += "\\0";
  }
  keystroke = keystroke.substring(0, 16);
  console.log(spawn.execSync('echo -ne "' + keystroke + '" > /dev/hidg0').toString());
});

process.on('SIGINT', function () {
  process.exit(0);
});
