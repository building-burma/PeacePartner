// initialize router
const express = require("express");
const router = express.Router(); 

router.get(["/home","/home.html","/homepage"], (req,res) => {
    // check if logged in
    if (req.session.loggedIn !== true) {
        res.redirect("/login.html"); 
    }
    res.sendFile(__dirname + "../templates/home.html")
});

module.exports = router