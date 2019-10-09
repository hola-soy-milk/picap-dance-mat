let DeviceHandle = require('linux-device');
let exec = require('child_process').exec;
let MPR121 = require('node-picap');

const p1Left = 0x04; // A
const p1Right = 0x05; // B
const p1Up = 0x06; // C
const p1Down = 0x07; // D
const p1Start = 0x0c; // I
const p1Back = 0x0d; // J

const p2Left = 0x08; // E
const p2Right = 0x09; // F
const p2Up = 0x0a; // G
const p2Down = 0x0b; // H
const p2Start = 0x0e; // K
const p2Back = 0x0f; // L

let sensitivity = parseInt(process.argv[2])
if(sensitivity == undefined) {
  sensitivity = 100;
}

// Set up the picap
let mpr121 = new MPR121('0x5C');
mpr121.setTouchThreshold(sensitivity);
mpr121.setReleaseThreshold(20);

// Open up access to the USB interface
let device = new DeviceHandle('/dev/hidg0', true, 16, (err, data) => {
  if(err) return console.log("ERROR:", err);
  console.log("received interval:", data.readUInt32LE(0).toString(16));
});

parsePressedKeys = (data) => {
  const pressedKeys = [];
  data.forEach((electrode, i) => {
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
          pressedKeys.push(p1Start);
          break;
        case 9:
          pressedKeys.push(p1Back);
          break;
        case 10:
          pressedKeys.push(p2Start);
          break;
        case 11:
          pressedKeys.push(p2Back);
          break;
      }
    }
  });
  return pressedKeys;
}

keystrokeFromPressedKeys = (pressedKeys) => {
  // TODO: Find out why we're prepending two blank keys
  keystroke = [0x00, 0x00];
  pressedKeys.forEach((key) => {
    keystroke.push(key);
  });
  while(keystroke.length < 8) {
    keystroke.push(0x00);
  }
  return keystroke.slice(0, 8);
}

// Process touches
mpr121.on('data', (data) => {
  console.log("Running with sensitivity" + sensitivity);
  const keys = parsePressedKeys(data);
  keystroke = keystrokeFromPressedKeys(keys);
  try {
    // Keystroke needs to be a byte array
    let buffer = Uint8Array.from(keystroke);
    device.write(buffer, (err) => {
      console.log("ERROR: ", err);
    });
  } catch(e) {
    console.log("ERROR: ", e);
  }
});

process.on('SIGINT', () => {
  device.close();
  process.exit(0);
});
