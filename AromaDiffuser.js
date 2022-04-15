const USBController = require('../../node_modules/aromadiffuser/lib/usb/usb_as_controller');
const ws = require('ws');

module.exports = {
    diffuser: "",
    aromaShooter: {},
    label: ["NO", "WHISKY", "SOYSOURCE", "SHAMPOO", "WAFU-DASHI", "HINOKI", "COFFEE"],

    Start: function () {
        this.Connect();
        this.WsServer();
    },

    Connect: function () {
        this.aromaShooter = new USBController();
        this.aromaShooter.scan((error, devices) => {
            if (error) {
                console.log("error -> " + error);
                return;
            }
            devices.forEach(device => {
                console.log("arom shooter is opened at " + device.serialPort);
                diffuser = device;
                this.aromaShooter.connect(device, (error, response) => {
                    if (error) {
                        console.log("error -> " + error);
                        return;
                    }
                })
            })
        });
    },

    WsServer: function () {
        const AromaServer = new ws.Server({ port: 5005 });
        AromaServer.on('connection', ws => {
            console.log("WebSocket Server (AromaDiffuser) is opened.");
            ws.on('message', message => {
                this.Diffuse(message);
            });

            ws.on('close', () => {
                console.log("WebSocket Server (AromaDiffuser) is closed.");
            });
        });
    },

    Diffuse: function (scents) {
        if (scents === "0") {
            this.aromaShooter.diffuse(diffuser, 0, true, [1], (error, response) => {
                if (error) {
                    console.error("Error on diffusing port: " + error.message);
                }
            });
        }
        else {
            console.log("Diffusing the scent of " + label[scents]);
            this.aromaShooter.diffuse(diffuser, 2000, true, [scents], (error, response) => {
                if (error) {
                    console.error("Error on diffusing port: " + error.message);
                }
            });
        }
    }
}