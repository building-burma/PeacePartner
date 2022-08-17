// initialize express
const express = require("express");
const session = require("express-session");
const app = express();

// for parsing form data
const bodyParser = require('body-parser')
const multer = require('multer');
const upload = multer();

// other imports
const path = require("path");
const logger = require("./logger");

// get constants from config file
const { WEBAPPPORT, SESSIONSECRET } = require(__dirname + "/config.json");

// for usage of pug templating
app.set('view engine', 'pug');
app.set('views','./templates');

// use sass middleware
// sass files are stored in /static/css, and are accessible by users as css files in /static/css
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, '/static'),
    dest: path.join(__dirname, '/static'),
    debug: false // false is the default
}));

app.use(session({
    secret: SESSIONSECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json()) // for parsing json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(upload.array()) // for parsing application/x-www-form-urlencoded

// logging of requests happens here. all requests first pass through here. banning/blacklisting of ips
// should also happen here.
app.all("*",(req,res,next) => {
    logger(`Received request from ${req.ip} for ${req.path}`)
    next();
});

app.use(require(__dirname + "/Routes/home"));
app.use(require(__dirname + "/Routes/auth"));
app.use(express.static(__dirname + "/static"));

// 404 page
app.all("*",(req,res) => {
    res.statusCode = 404;
    res.sendFile(__dirname + "/static/404.html");
});

app.listen(WEBAPPPORT, () => {
    console.log(`Server is listening on port ${WEBAPPPORT}`);
});