require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require("passport");
require("./config/passport")(passport);
// const File = require("./models/file");
// const User = require("./models/user.js");

const app = express();

// DATABASE CONNECTION
mongoose.connect(process.env.DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("error", (err) => {
    console.log(err);
});
db.on("open", () => {
    console.log("database connection success");
});

// MIDDLEWARE
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server is running on : " + port));
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})