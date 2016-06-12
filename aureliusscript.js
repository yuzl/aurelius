// Get all the node modules
var i2c = require('i2c-bus');
var mpu = require('i2c-mpu6050');
var gpio = require('pi-gpio');
var cam = require('raspicam');
var gm = require('gm');

// ==================
// SETUP I2C - MPU650

// get address from raspberry using 'sudo i2cdetect -y 1'
var address = 0x68;
var i2c1 = i2c.openSync(1);

var sensor = new mpu(i2c1, address);

// read all data
var mpuData = sensor.readSync();
var temp = mpuData.temp;
var rotation = mpuData.rotation; // object with x, y, z data
var gyro = mpuData.gyro; // object with x, y, z data
var accel = mpuData.accel; // object with x, y, z data


// ======================
// SETUP GPIO - IR SENSOR

var pin = 12;
var returnValue;
var i = 0;
var size = 1000;
var gpioData = new Array(size);

var readGpio = funtion() {
  gpio.open(pin, "input", function(err) {
    gpio.read(pin, function(err, value) {
      if(value === 1){
        returnValue = 'true';
      } else {
        returnValue = 'false';
      }

      gpioData[i] = (returnValue == 'true' ? 1 : 0);
      i++;
      if (i >= size) {i = 0;}

      console.log(returnValue);

      gpio.close(pin);

      readGpio();
    });
  });
};

readGpio();


// ==============
// SETUP RASPICAM

var camOptions = {
  mode: "photo",
  encoding: "jpg",
  quality: 10,
  output: "compareImg.jpg"
};

var camera = new cam(camOptions);

camera.start(camOptions);


// =============
// SETUP COMPARE

var originalImg = 'originalImg.jpg';
var compareImg = 'compareImg.jpg';

gm.compare(originalImg, compareImg, function(err, equality, raw) {
  console.log('comparing original file with current photo');
  if (err) return handle(err);
  console.log('equality: ' + equality);
  console.log('raw: ' + raw);
})