// initialize router
const express = require("express");
const router = express.Router(); 

// db access
const db = require(__dirname + "/../db")

// other imports 
const crypto = require("crypto");

router.post("/login.html", (req,res,next) => {
    if (req.body.username && req.body.password) {
        db.connect((err, client, done) => {
            client.query('SELECT passhash, passsalt FROM users WHERE username = $1;', [req.body.username], (err, dbres) => {
                done()
                if (err) {
                    console.log(err.stack)
                    // TODO: handle err
                } else {
                    console.log(dbres.rows[0])
                    if (crypto.createHash('sha256').update(req.body.password + dbres.rows[0].passsalt).digest('hex') == dbres.rows[0].passhash) {
                        req.session.loggedIn = true;
                        req.session.username = req.body.username; 

                        res.statusCode = 302
                        res.setHeader('Location', '/')
                        res.write('Redirecting')
                        res.end()
                    } else {
                        res.redirect("/login.html");
                    }
                }
            })
        })
    }
});

router.get("/logout.html", (req,res,next) => {
    req.session.loggedIn = false;
    req.session.username = undefined;
    next()
});

module.exports = router