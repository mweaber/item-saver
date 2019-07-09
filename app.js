const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const app = express();=

// Load Routes
const items = require('./routes/items');
const users = require('./routes/users');

// Map global promises
mongoose.Promise = global.Promise;

// DB Config
//  Unable to make work via video

// Connect to mongoose
mongoose.connect('mongodb://localhost/item-saver', {
    // useMongoClient: true, ..."this is no longer needed"
    useNewUrlParser: true
})
.then(() => console.log('MongoDB connected....'))
.catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body-Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Method-Override Middleware
app.use(methodOverride('_method'));

// Express-Session Middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
}));

// Flash Middleware
app.use(flash());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Index Route
app.get('/', (req, res) => {
    const title = 'Welcome'
    res.render('index', {
        title: title
    });
});

// About Route
app.get('/about', (req, res) => {
    res.render('about');
});

// Use Items Routes
app.use('/items', items);

// Use Users Routes
app.use('/users', users);

// Passport Config
require("./config/passport")(passport);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server start locally on http://localhost:${PORT}`)
});

