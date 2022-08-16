// initialize router
const express = require("express");
const router = express.Router(); 

router.get(["/","/index.html","/index"], (req,res) => {
    // check if logged in
    if (req.session.loggedIn != true) {
        res.redirect("/login.html"); 
    }
    res.send("Home page, hello " + req.session.username)
});

module.exports = router