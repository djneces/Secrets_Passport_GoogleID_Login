//jshint esversion:6
// Hyper:
// Najedu do Secrets
// npm init -y
// npm i express ejs body-parser
// npm i mongoose

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", { useUnifiedTopology: true, useNewUrlParser: true });

// user schema, pro encryption potrebujeme mongoose.Schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});



// we need to include plugin schema before mongoose model!, we add encrypt package
// adding encryptedFields to encrypt only password field and not all
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });


//use user schema to set up user model
const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  // registrace user prichazi z inputu z register.ejs, dostavame value z name=username a password
//vytvoreni noveho user pomoci User modelu
  const newUser = new User ({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {
  // username a password prichazi jako name value z login.ejs
  const username = req.body.username;
  const password = req.body.password;
// looks through our collection of users, email field in our DB is matching with username
// given by user, foundUser je libovolne zadany
  User.findOne({email: username}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      // if there was a found user with that email
      if (foundUser) {
        // if found user password in DB matches the password given by user
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
