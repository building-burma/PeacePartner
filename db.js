const { Pool } = require("pg");

const { POSTGRESPORT, POSTGRESDATABASE } = require("./config.json");

const pool = new Pool({
    port: POSTGRESPORT,
    database: POSTGRESDATABASE
});

pool.on("error", (err) => {
    console.log("POSTGRES err: " + err);
})

module.exports = pool;