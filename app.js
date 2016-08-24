var express = require('express');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

mongoose.connect('mongodb://localhost/passportjwt');

var LocalStrategy = require('passport-local').Strategy;

var User = require('./UserModel');
var expressJWT = require('express-jwt');
var auth = expressJWT({secret: 'SECRET'});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/hello', auth, function (req, res) {
  res.json(req.user);
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

app.post('/register', function(req, res, next){
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

app.get('/register', function (req, res) {
  res.sendFile(__dirname + '/register.html');
});

app.post('/login', function(req, res){

});

passport.use('login', new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      return done(null, user);
    });
  }
));

app.post('/login', function(req, res, next){
  passport.authenticate('login', function(err, user){
    if(err){ return next(err); }

    if (user) {
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401);
    }
  })(req, res, next);
});

app.listen(8000);