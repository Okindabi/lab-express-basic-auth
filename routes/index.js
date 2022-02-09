const { use } = require("express/lib/application");
const User = require("../models/User.model");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const bcrypt = require("bcryptjs/dist/bcrypt");
const router = require("express").Router();

/* GET home page */

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/signup", (req, res) => res.render("signup"));

router.post("/signup", function (req, res, next) {
  const salt = genSaltSync(10);
  const hashedPass = hashSync(req.body.password, salt);

  User.create({
    username: req.body.username,
    password: hashedPass,
  })
    .then(res.redirect("/"))
    .catch((err) => {
      console.log("something went wrong, ", err);
    });
});

router.get("/login", (req, res) => res.render("login"));
router.post("/login", (req, res) => {
  let errorMessage = "Check username or password";
  if (!req.body.username || !req.body.password) {
    return res.render("login", { errorMessage });
  }
  User.findOne({ username: req.body.username }).then((foundUser) => {
    if (!foundUser) {
      errorMessage = "User can not be found";
      return res.render("login", { errorMessage });
    }
    const match = bcrypt.compareSync(req.body.password, foundUser.password);
    if (!match) {
      errorMessage = "password incorrect";
      return res.render("login", { errorMessage });
    } else {
      req.session.user = foundUser;
      console.log(req.session.user);
      res.redirect("/main");
    }
  });
});

router.get("/main", (req, res) => {
  if (req.session?.user?.username) {
    res.render("main", req.session.user);
  } else {
    res.redirect("/login");
  }
});

router.get("/private", (req, res) => {
  if (req.session?.user?.username) {
    res.render("private", req.session.user);
  } else {
    res.redirect("/login");
  }
});

// logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
