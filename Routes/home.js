// initialize router
const express = require("express");
const router = express.Router(); 

router.get(["/home","/home.html","/homepage"], (req,res) => {
    // check if logged in
    if (req.session.loggedIn !== true) {
        res.redirect("/login.html"); 
    }
    res.render("home", {
        name: req.session.username
    });
});

module.exports = router