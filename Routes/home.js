// initialize router
const express = require("express");
const router = express.Router(); 

router.get(["/","/index.html","/index"], (req,res) => {
    // check if logged in
    if (!req.session.loggedIn) {
        res.redirect("/login.html"); 
    }
    res.send("Home page")
});

module.exports = router