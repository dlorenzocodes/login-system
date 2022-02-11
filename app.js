const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

const {
    NODE_ENV = 'development',
} = process.env;

const IN_PROD = NODE_ENV === 'production';

// Middleware
app.use(express.urlencoded({ extended: false }))

// Express Session
app.use(session({
    secret: 'mysecretkey',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: IN_PROD,
        sameSite: 'strict'
    }
}));

// Connect flash
app.use(flash());

// Global Vars // Custom Middleware
app.use((req, res, next) => {

    // to set global variables
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// DB Config
const db = require('./config/keys').mongoURI;

// Connect To Mongo
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected ...'))
    .catch((err) => console.log(err))

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs')



// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Listening on port ${port} ...`));