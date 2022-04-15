const child_process = require("child_process");

module.exports = {
    Start: function () {
        console.log("Start Matterport");
        try {
            process.chdir('../../');
            child_process.exec('npm start', (error, stdout, stderr) => {
                if (error) {
                    console.log(stderr);
                    console.log("Failed");
                }
                else {
                    console.log(stdout);
                    console.log("OK");
                }
            });
        }
        catch (err) {
            console.log('chdir: ' + err);
        }
    }
}