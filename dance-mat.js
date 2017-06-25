var DeviceHandle = require('linux-device');
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

var device = new DeviceHandle('/dev/hidg0', true, 16, function(err, data) {
    if(err) return console.log("ERROR:", err);
    console.log("received interval:", data.readUInt32LE(0).toString(16));
});

parsePressedKeys = function(data) {
  var pressedKeys = [];
  data.forEach(function(electrode, i) {
    if (electrode.isNewTouch) {
      switch(i) {
        case 0:
          pressedKeys.push(p1Left);
          break;
        case 1:
          pressedKeys.push(p1Right);
          break;
        case 2:
          pressedKeys.push(p1Up);
          break;
        case 3:
          pressedKeys.push(p1Down);
          break;
        case 4:
          pressedKeys.push(p2Left);
          break;
        case 5:
          pressedKeys.push(p2Right);
          break;
        case 6:
          pressedKeys.push(p2Up);
          break;
        case 7:
          pressedKeys.push(p2Down);
          break;
        case 8:
          pressedKeys.push(p2Up);
          break;
        case 9:
          pressedKeys.push(p1Start);
          break;
        case 10:
          pressedKeys.push(p1Back);
          break;
      }
    }
  });
  return pressedKeys;
}

keystrokeFromPressedKeys = function(pressedKeys) {
  keystroke = "\\0\\0";
  pressedKeys.forEach(function(key) {
    keystroke += "\\" + key;
  });
  while(keystroke.length < 16) {
    keystroke += "\\0";
  }
  return keystroke.substring(0, 16);
}

// correct address for the Pi Cap - other boards may vary
mpr121 = new MPR121('0x5C');
mpr121.setTouchThreshold(40);
mpr121.setReleaseThreshold(20);

mpr121.on('data', function(data) {
  keys = parsePressedKeys(data);
  keystroke = keystrokeFromPressedKeys(keys);
  device.write(keystroke, function(err) {
  });
  console.log(spawn.execSync('echo -ne "' + keystroke + '" > /dev/hidg0').toString());
});

process.on('SIGINT', function () {
  device.close();
  process.exit(0);
});
