var DeviceHandle = require('linux-device');
var MPR121 = require('node-picap');
var mpr121;

var p1Left = 0x04; // A
var p1Right = 0x05; // B
var p1Up = 0x06; // C
var p1Down = 0x07; // D

var p2Left = 0x08; // E
var p2Right = 0x09; // F
var p2Up = 0x0a; // G
var p2Down = 0x0b; // H

var p1Start = 0x0c; // I
var p1Back = 0x0d; // J

// Open up access to the USB interface
var device = new DeviceHandle('/dev/hidg0', true, 16, function(err, data) {
  if(err) return console.log("ERROR:", err);
  console.log("received interval:", data.readUInt32LE(0).toString(16));
});

parsePressedKeys = function(data) {
  var pressedKeys = [];
  data.forEach(function(electrode, i) {
    if (electrode.isTouched) {
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
  keystroke = [0x00, 0x00];
  pressedKeys.forEach(function(key) {
    keystroke.push(key);
  });
  while(keystroke.length < 8) {
    keystroke.push(0x00);
  }
  return keystroke.slice(0, 8);
}

var sensitivity = parseInt(process.argv[2])
if(sensitivity == undefined) {
  sensitivity = 100;
}

// Set up the picap
mpr121 = new MPR121('0x5C');
mpr121.setTouchThreshold(sensitivity);
mpr121.setReleaseThreshold(20);

// Process touches
mpr121.on('data', function(data) {
  console.log("Running with sensitivity" + sensitivity);
  keys = parsePressedKeys(data);
  keystroke = keystrokeFromPressedKeys(keys);
  try {
    // Keystroke needs to be a byte array
    var buffer = Uint8Array.from(keystroke);
    device.write(buffer, function(err) {
    });
  } catch(e) {
    console.log("ERROR: ", e);
  }
});

process.on('SIGINT', function () {
  device.close();
  process.exit(0);
});
