// initialize router
const express = require("express");
const router = express.Router(); 

router.get(["/home","/home.html","/homepage"], (req,res) => {
    // check if logged in
    if (req.session.loggedIn !== true) {
        res.redirect("/login.html"); 
    }
    let paragraphs = ["hello","hello 2"], name = req.session.username;
    res.render("home", {
        name,
        paragraphs
    });
});

module.exports = router