// initialize router
const express = require("express");
const router = express.Router();

// get database pool
const db = require(__dirname + '/../db');

router.get('/', (req,res) => {
    ;(async () => {
        const client = await db.connect();
        const userresult = await client.query('SELECT * FROM users WHERE id = $1', [parseInt(req.query.userid)]);
        const userdata = userresult.rows[0];
        const extrauserresult = await client.query(`SELECT * FROM ${(userdata.type) ? "sponsors" : "refugees"} WHERE id = $1`, [(userdata.type) ? userdata.sponsorid : userdata.refugeeid]);
        const extrauserdata = extrauserresult.rows[0];
        res.render('profile', {
            username: userdata.username,
            fullname: userdata.name,
            accommodatenum: (userdata.type) ? extrauserdata.accommodatenum : extrauserdata.persons,
        });
    })()
})

module.exports = router
