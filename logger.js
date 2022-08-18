const fs = require("fs");

// datetime of execution for logging
const startdate = new Date();

module.exports = function logger(string) {
    fs.appendFile(__dirname + `/logs/${startdate}.log`, string + "\n", (err) => {
        // TODO: handle err
    });
}