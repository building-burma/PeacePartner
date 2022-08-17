// initialize express
const express = require("express");
const session = require("express-session");
const app = express();

// for parsing form data
const bodyParser = require('body-parser')
const multer = require('multer');
const upload = multer();

// other imports

// get constants from config file
const { WEBAPPPORT, SESSIONSECRET } = require(__dirname + "/config.json");

app.set('view engine', 'pug');
app.set('views','./templates');

app.use(session({
    secret: SESSIONSECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(upload.array()) // for parsing application/x-www-form-urlencoded

app.all("*",(req,res,next) => {
    console.log(`Recieved request from ${req.ip} for ${req.path}`);
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