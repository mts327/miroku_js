const fs = require('fs');
const ws = require('ws');

module.exports = {
    Start: function () {
        this.Connect();
    },

    Connect: function () {
        const LogServer = new ws.Server({ port: 5006 });
        LogServer.on('connection', ws => {
            let filePath;
            console.log("WebSocket Server (Log) is opened.");
            ws.on('message', (e) => {
                let data = e.split(',');
                if (data[0] === "init") {
                    filePath = data[1];
                }
                else {
                    let date = new Date();
                    fs.appendFileSync('./src/log/' + filePath + '.txt',
                        date.getHours() + "時" +
                        date.getMinutes() + "分" +
                        date.getSeconds() + "秒" +
                        date.getMilliseconds() + ", " +
                        data[1] + ", " +
                        data[2] + ", " +
                        data[3] + ", " +
                        date.getTime() + ", " +
                        data[0] + "\n");
                }
            });

            ws.on('close', () => {
                console.log("WebSocket Server (Log) is closed.");
            });
        });
    }
}