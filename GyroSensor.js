const SerialPort = require('serialport');
const ws = require('ws');
const Mirokunosato = require("./Mirokunosato");

module.exports = {
    IDs: [
        "201910090328_C00000000",
        "201910222097_C00000000",
        "202101123042_C00000000",
        "202101122323_C00000000",
        "202101122339_C00000000"
    ],

    pitch: 0,
    yaw: 0,

    Start: function () {
        this.Connect();
        this.WsServer();
    },

    Connect: async function () {
        let comPorts;
        let isOK = false;
        await SerialPort.list().then(ports => {
            comPorts = ports;
        });
        for (let i = 0; i < comPorts.length; i++) {
            if (comPorts[i].manufacturer === "Microsoft") {
                this.IDs.forEach(id => {
                    if (comPorts[i].pnpId.includes(id) && !isOK) {
                        let gyroSensor = new SerialPort(comPorts[i].path, {
                            baudRate: 115200,
                            parity: 'none',
                            dataBits: 8,
                            stopBits: 1,
                            rtscts: true,
                            autoOpen: false
                        });
                        gyroSensor.open(e => {
                            if (!e) {
                                console.log("Gyrosensor is opened at " + gyroSensor.path);
                                Mirokunosato.Start();
                                this.Receiver(gyroSensor);
                            }
                        });
                    }
                })
            }
        }
    },

    Receiver: function (gyroSensor) {
        let start = 0;
        let plus = 0;
        let minus = 0;
        let sign = 0;

        gyroSensor.on('data', data => {
            //console.log(data);
            let buf = Buffer.from(data);
            start = buf.indexOf(0x53);
            if (buf[start - 1] === 0x55) {
                this.pitch = (buf[start + 4] * Math.pow(2, 8) + buf[start + 3]) / 32768 * 180;
                this.yaw = (buf[start + 6] * Math.pow(2, 8) + buf[start + 5]) / 32768 * 180;
                if (this.pitch > 180) {
                    this.pitch -= 360;
                }
                if (this.yaw > 180) {
                    this.yaw -= 360;
                }
                if (sign === 0) {
                    sign = Math.sign(this.yaw);
                }
                if (Math.sign(this.yaw) !== 0 && Math.sign(this.yaw) !== sign) {
                    if (Math.abs(this.yaw) > 150) {
                        (sign === 1 && Math.sign(this.yaw) === -1) ? plus += 1 : minus += 1;
                    }
                    sign = Math.sign(this.yaw);
                }
                this.yaw += (plus - minus) * 360;
            }
            // console.log(this.pitch, this.yaw);
        });
    },

    WsServer: function () {
        const GyroServer = new ws.Server({ port: 5004 });
        GyroServer.on('connection', ws => {
            console.log("WebSocket Server (GyroSensor) is opened.");
            ws.on('message', e => {
                GyroServer.clients.forEach(client => {
                    client.send(this.pitch + "," + this.yaw);
                    // this.Send(client);
                });
            });

            ws.on('close', () => {
                console.log("WebSocket Server (GyroSensor) is closed.");
            });
        });
    },

    Send: function (client) {
        // console.log(this.pitch, this.yaw);
        client.send(this.pitch + "," + this.yaw);
    }
}
