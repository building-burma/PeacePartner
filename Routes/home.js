// initialize router
const express = require("express");
const router = express.Router();

// other imports
const path = require("path");

// import for database connection
const db = require(__dirname + "/../db");

router.get(["/home","/home.html","/homepage"], (req,res) => {
    // check if logged in
    if (req.session.loggedIn !== true) {
        res.redirect("/login.html"); 
    }

    let matches = [];

    ;(async () => {
        const client = await db.connect();
        const matchesRes = await client.query('SELECT firstuserid, seconduserid FROM matches WHERE firstuserid = $1 OR seconduserid = $1 ORDER BY matchscore DESC',[req.session.userid]);
        for (let n=0;n<matchesRes.rows.length;n++) {
            const otherId = (matchesRes.rows[n].firstuserid === req.session.userid) ? matchesRes.rows[n].seconduserid : matchesRes.rows[n].firstuserid;
            const otherUserData = await client.query('SELECT * FROM users WHERE id = $1', [otherId]);
            let otherExtraUserData;
            if (otherUserData.rows[0].type) {
                otherExtraUserData = await client.query('SELECT * FROM sponsors WHERE id = $1', [otherUserData.rows[0].sponsorid]);
            } else {
                otherExtraUserData = await client.query('SELECT * FROM refugees WHERE id = $1', [otherUserData.rows[0].refugeeid]);
                otherExtraUserData.rows[0].picture = otherExtraUserData.rows[0].picture.toString('base64'); // convert image into base64
            }
            matches.push(Object.assign(otherUserData.rows[0], otherExtraUserData.rows[0]));
        }
        res.render("home",{
            title: 'Home',
            name: req.session.username,
            matches:matches,
        })
    })()
});

module.exports = router