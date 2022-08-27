// initialize router
const express = require("express");
const router = express.Router(); 

// file upload
const multer = require('multer');
const upload = multer();

// db access
const db = require(__dirname + "/../db");

// for matching algorithm
const matcher = require(__dirname + "/../matcher");

// other imports 
const crypto = require("crypto");
const fs = require("fs");

router.get("/login.html", (req,res,next) => {
   res.render("base", {
       title: "Login",
       content: fs.readFileSync(__dirname + "/../templates/login.html")
   })
});

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
                    if (crypto.createHash('sha256').update(req.body.password + dbres.rows[0].passsalt).digest('hex') === dbres.rows[0].passhash) {
                        req.session.loggedIn = true;
                        req.session.username = req.body.username; 

                        res.statusCode = 302
                        res.setHeader('Location', '/home.html')
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

router.get("/register.html", (req,res,next) => {
    res.render("base", {
        title: "Register",
        extrastyle: '/css/register.css',
        extrascript: '/js/registryValidator.js',
        content: fs.readFileSync(__dirname + "/../templates/register.html")
    });
});

router.post("/register.html", (req,res,next) => {
    const i = req.body // i for inputs. code is way cleaner like this :0

    const validGeneralInputs = {
        type: i.type,
        name: i.name, // TODO: clean input
        accomodatenum: (Number(i.accommodatenum) >= 0) ? Number(i.accommodatenum) : undefined,
        username: i.username, // TODO: clean input
        passhash: (i.passhash.length === 64 && i.passhash.match(/[0-9a-f]+/)[0] === i.passhash) ? i.passhash : undefined,
        passsalt: (i.passsalt.length === 128 && i.passsalt.match(/[0-9A-Za-z]+/)[0] === i.passsalt) ? i.passsalt : undefined,
    }
    
    const requiredGeneralInputs = [
        'type',
        'name',
        'accomodatenum',
        'username',
        'passhash',
        'passsalt',
    ];

    const invalidError = () => {
        res.send("Invalid input");
        res.end()
    }

    for (let n=0;n<requiredGeneralInputs.length;n++) {
        if (!validGeneralInputs[n]) return invalidError();
    }

    let foreignid;

    if (validGeneralInputs.type === "SP") {
        // verify sponsor specific input
        const validSponsorInputs = {
            familycomp: (i.familycomp === "SM" || i.familycomp === "SF" || i.familycomp === "FA") ? i.familycomp : undefined,
            country: (i.country === "US" || i.country ===  "CA" || i.country === "GB") ? i.country : undefined,
            city: i.city,
            state: i.state,
        }

        const requiredSponsorInputs = [
            'familycomp',
            'country',
            'city',
        ];
        
        for (let n=0;n<requiredSponsorInputs.length;n++) {
            if (!validSponsorInputs[n]) return invalidError();
        }

        // create sponsors table entry
        // * get id of last sponsor entry
        // * create entry and save id for users table
        db.connect((err, client, done) => {
            if (!err) {
                client.query('SELECT id FROM sponsors ORDER BY id DESC LIMIT 1',(iderr, idres) => {
                    if (!iderr) {
                        foreignid = idres.rows[0].id + 1; // TODO: validate if this is a number > 0. if nothing, id = 1
                        client.query('INSERT INTO sponsors (id, familycomp, accommodatenum, country, city, state) VALUES ($1,$2,$3,$4,$5,$6);',
                            [foreignid,
                                validSponsorInputs.familycomp,
                                validGeneralInputs.accomodatenum,
                                validSponsorInputs.country,
                                validSponsorInputs.city,
                                validGeneralInputs.state
                            ], (inserterr) => {
                                if (!inserterr) {
                                    createUser();
                                }
                                done();
                            });
                    }
                });
            }
        })
    }

    if (validGeneralInputs.type === "RU") {
        // verify refugee specific input
        const validRefugeeInputs = {
            currcity: i.currcity,
            currcountry: i.currcountry,
            prefcountry: (i.country === "US" || i.country ===  "CA" || i.country === "GB") ? i.country : undefined,
            prefcity: i.city,
            state: i.state,
            pets: i.pets,
            picture: i.picture,
            special: i.special
        }

        const requiredRefugeeInputs = [
            'currcity',
            'prefcity',
            'currcountry',
            'prefcountry',
            'pets',
            'picture',
        ];

        for (let n=0;n<requiredRefugeeInputs.length;n++) {
            if (!validRefugeeInputs[n]) return invalidError();
        }

        // create sponsors table entry
        // * get id of last sponsor entry
        // * create entry and save id for users table
        db.connect((err, client, done) => {
            if (!err) {
                client.query('SELECT id FROM refugees ORDER BY id DESC LIMIT 1',(iderr, idres) => {
                    if (!iderr) {
                        foreignid = idres.rows[0].id + 1; // TODO: validate if this is a number > 0. if nothing, id = 1
                        client.query('INSERT INTO refugees (id, currcity, currcountry, prefcity, prefcountry, prefstate, persons, pets, picture) VALUES ($1,$2,$3,$4,$5,$6);',
                            [foreignid,
                                validRefugeeInputs.currcity,
                                validRefugeeInputs.currcountry,
                                validRefugeeInputs.prefcity,
                                validRefugeeInputs.prefcountry,
                                validGeneralInputs.state,
                                validGeneralInputs.accomodatenum,
                                validRefugeeInputs.pets,
                                validRefugeeInputs.picture,
                            ], (inserterr) => {
                                if (!inserterr) {
                                    createUser();
                                }
                                done();
                            });
                    }
                });
            }
        })

    }

    const createUser = () => {
        db.connect((err, client, done) => {
            if (!err) {
                client.query('SELECT id FROM users ORDER BY id DESC LIMIT 1', (iderr,idres) => {
                    const userid = idres.rows[0].id + 1; //TODO: you know.
                    const foreignidName = (type === "SP") ? "sponsorId" : "refugeeId";
                    client.query(`INSERT INTO users (id, type, name, username, passhash, passsalt, ${foreignidName}) VALUES ($1,$2,$3,$4,$5,$6,$7);`,
                        [
                            userid,
                            (validGeneralInputs.type === "SP"),
                            validGeneralInputs.name,
                            validGeneralInputs.username,
                            validGeneralInputs.passhash,
                            validGeneralInputs.passsalt,
                            foreignid
                        ], (inserterr) => {
                        res.send("success")
                    })
                })
            }
        });
    }
})

router.get("/logout.html", (req,res,next) => {
    req.session.loggedIn = false;
    req.session.username = undefined;
    next()
});

module.exports = router