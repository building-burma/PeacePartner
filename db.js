// using a postgres connection pool
const { Pool } = require("pg");

// grabbing constants from config.json
const { POSTGRESPORT, POSTGRESDATABASE, POSTGRESPOOLSIZE } = require("./config.json");

// configuring pool
const pool = new Pool({
    port: POSTGRESPORT,
    database: POSTGRESDATABASE,
    max: POSTGRESPOOLSIZE
});

pool.on("error", (err) => {
    console.log("POSTGRES err: " + err);
})

module.exports = pool;