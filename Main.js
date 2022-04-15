const GyroSensor = require("./GyroSensor");
const AromaDiffuser = require("./AromaDiffuser");
const Log = require("./Log");

function Main() {
    Log.Start();
    AromaDiffuser.Start();
    GyroSensor.Start();
}

Main();