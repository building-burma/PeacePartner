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
    // using an async IIFE
    ;(async () => {
        const client = await db.connect();
        const result = await client.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
        if (crypto.createHash('sha256').update(req.body.password + result.rows[0].passsalt).digest('hex') === result.rows[0].passhash) {
            req.session.loggedIn = true;
            req.session.username = req.body.username;
            req.session.userid = result.rows[0].id;

            res.statusCode = 302
            res.setHeader('Location', '/home.html')
            res.write('Redirecting')
            res.end()
        } else {
            res.redirect("/login.html");
        }
    })()
});

router.get("/register.html", (req,res,next) => {
    let missingErrors = (req.query.missing) ? `The following field is missing: ${req.query.missing}` : "";
    let usernameError = (req.query.usernameerr) ? `Username already exists` : "";
    res.render("register", {
        title: "Register",
        extrastyle: '/css/register.css',
        extrascript: '/js/registryValidator.js',
        missingErrors,
        usernameError,
    });
});

router.post("/register.html", upload.single("picture"),(req,res,next) => {
    const i = req.body // i for inputs. code is way cleaner like this :0

    const validGeneralInputs = {
        type: i.type,
        name: i.name, // TODO: clean input
        accomodatenum: (Number(i.accommodatenum) >= 0) ? Number(i.accommodatenum) : undefined,
        pets: (i.pets > 0) ? i.pets: undefined,
        username: i.username, // TODO: clean input
        passhash: (i.passhash.length === 64 && i.passhash.match(/[0-9a-f]+/)[0] === i.passhash) ? i.passhash : undefined,
        passsalt: (i.passsalt.length === 128 && i.passsalt.match(/[0-9A-Za-z]+/)[0] === i.passsalt) ? i.passsalt : undefined,
        email: i.email,
    }
    
    const requiredGeneralInputs = [
        'type',
        'name',
        'accomodatenum',
        'pets',
        'username',
        'passhash',
        'passsalt',
        'email',
    ];

    let missing = [];

    const retIfMissing = () => {
        if (missing.length !== 0) {
            res.redirect(`/register.html?missing=${missing}`);
            console.log(`/register.html?missing=${missing[0]}`)
            console.log('redirecting')
            res.end()
            return true;
        }
        return false
    }

    let pettypes = "";
    for (let n=0;n<validGeneralInputs.pets;n++) {
        pettypes += i['pet'+n] + ',';
    }
    validGeneralInputs.pettypes = pettypes;

    requiredGeneralInputs.forEach((n) => {
        if (!validGeneralInputs[n]) {
            missing.push(n);
        }
    });
    if (retIfMissing()) return;

    let foreignid;

    if (validGeneralInputs.type === "SP") {
        // verify sponsor specific input
        const validSponsorInputs = {
            familycomp: (i.familycomp === "SM" || i.familycomp === "SF" || i.familycomp === "FA") ? i.familycomp : undefined,
            country: (i.country === "US" || i.country ===  "CA" || i.country === "GB") ? i.country : undefined,
            city: (i.city !== "") ? i.city : undefined,
            state: i.state,
        }

        const requiredSponsorInputs = [
            'familycomp',
            'country',
            'city',
        ];

        requiredSponsorInputs.forEach((n) => {
            if (!validSponsorInputs[n]) {
                missing.push(n);
            }
        });
        if (retIfMissing()) return;

        // create sponsors table entry
        // * get id of last sponsor entry
        // * create entry and save id for users table

        // using async IIFE
        ;(async () => {
            const client = await db.connect();
            const sponsorIdRes = await client.query('SELECT id FROM sponsors ORDER BY id DESC LIMIT 1');
            foreignid = (sponsorIdRes.rows[0]) ? sponsorIdRes.rows[0].id + 1 : 1;
            console.log('refugee')
            await client.query('INSERT INTO sponsors (id, familycomp, accommodatenum, pets, pettypes, country, city, state) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);',
                [foreignid,
                validSponsorInputs.familycomp,
                validGeneralInputs.accomodatenum,
                validGeneralInputs.pets,
                (validGeneralInputs.pettypes !== "") ? validGeneralInputs.pettypes : null,
                validSponsorInputs.country,
                validSponsorInputs.city,
                validGeneralInputs.state]
            );
            createUser(validSponsorInputs);
            client.release()
        })()
    }

    if (validGeneralInputs.type === "RU") {
        // verify refugee specific input

        let validRefugeeInputs = {
            currcity: i.currcity,
            currcountry: i.currcountry,
            prefcountry: (i.prefcountry === "US" || i.prefcountry ===  "CA" || i.prefcountry === "GB") ? i.prefcountry : undefined,
            prefcity: i.prefcity,
            state: i.state,
            picture: (req.file.mimetype === "image/png") ? req.file : undefined,
            special: i.special
        }

        const requiredRefugeeInputs = [
            'currcity',
            'prefcity',
            'currcountry',
            'prefcountry',
            'picture',
        ];

        requiredRefugeeInputs.forEach((n) => {
            if (!validRefugeeInputs[n]) {
                missing.push(n);
            }
        });
        if (retIfMissing()) return;

        // create sponsors table entry
        // * get id of last sponsor entry
        // * create entry and save id for users table
        // using async IIFE
        ;(async () => {
            const client = await db.connect();
            const refugeeIdRes = await client.query('SELECT id FROM refugees ORDER BY id DESC LIMIT 1');
            foreignid = (refugeeIdRes.rows[0]) ? refugeeIdRes.rows[0].id + 1 : 1;
            await client.query('INSERT INTO refugees (id, currcity, currcountry, prefcity, prefcountry, prefstate, persons, pets, pettypes, picture) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);',
                [foreignid,
                validRefugeeInputs.currcity,
                validRefugeeInputs.currcountry,
                validRefugeeInputs.prefcity,
                validRefugeeInputs.prefcountry,
                validGeneralInputs.state,
                validGeneralInputs.accomodatenum,
                validGeneralInputs.pets,
                (validGeneralInputs.pettypes !== "") ? validGeneralInputs.pettypes : null,
                validRefugeeInputs.picture.buffer,]
            );
            createUser(validRefugeeInputs);
            client.release()
        })()
    }

    // TODO: check if username exists
    const createUser = (extraInputs) => {
        ;(async () => {
            const client = await db.connect();
            const usernameCheck = await client.query('SELECT id FROM users WHERE username = $1',[validGeneralInputs.username]);
            if (usernameCheck.rows[0]) {
                console.log('username exists');
                // TODO: add invalid username behaviour
                res.redirect('/register.html?usernameerr=1');
                // TODO: delete sponsor/refugee entry
                return
            }
            const idres = await client.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
            const userid = (idres.rows[0]) ? idres.rows[0].id + 1 : 1; //TODO: you know.
            const foreignidName = (validGeneralInputs.type === "SP") ? "sponsorId" : "refugeeId";
            console.log('create user')
            await client.query(`INSERT INTO users (id, type, name, username, email, passhash, passsalt, ${foreignidName}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`,
                [userid,
                (validGeneralInputs.type === "SP"),
                validGeneralInputs.name,
                validGeneralInputs.username,
                validGeneralInputs.email,
                validGeneralInputs.passhash,
                validGeneralInputs.passsalt,
                foreignid]
            );
            res.statusCode = 302
            res.setHeader('Location', '/home.html')
            res.write('Redirecting')
            res.end()
            matcher(Object.assign({id:userid}, validGeneralInputs, extraInputs));
        })()
    }
})

router.get("/logout.html", (req,res,next) => {
    req.session.loggedIn = false;
    req.session.username = undefined;
    next()
});

module.exports = router