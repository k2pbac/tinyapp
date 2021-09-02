const express = require("express");
const router = express.Router();
const {
  userExists,
  authenticateUser,
} = require("../middleware");
const { users } = require("../seeds/userSeeds");
const { v4: uuidv4 } = require("uuid");

router.route("/register")
  .get((req, res) => {
    res.render("urls_register");
  })
  .post((req, res) => {
    const { email, password } = req.body;
  
    if (!userExists(email)) {
      let id = uuidv4();
      users[id] = { id, email, password };
      res.cookie("username", email);
      res.cookie("userID", id);
      req.flash("success", "Welcome to TinyApp, you are now registered!");
      res.redirect("/urls");
    } else {
      req.flash("error", "A user with this email already exists.");
      res.status(400).redirect("/register");
    }
  });


  router.route("/login")
    .get((req, res) => {
      res.status(200).render("urls_login");
    })
    .post((req, res) => {
      const { email, password } = req.body;
      const user = authenticateUser(email, password);
      if (user) {
        req.flash("success", "You have succesfully logged in!");
        res.cookie("username", email);
        res.cookie("userID", user.id);
        res.status(200).redirect("/urls");
      } else {
        req.flash("error", "Please enter a valid username and/or password");
        res.status(401).render("urls_login");
      }
    });

    router.post("/logout", (req, res) => {
        if (req.cookies.username) {
          res.clearCookie("username");
          res.clearCookie("userID");
          req.flash("success", "Successfully logged out!");
          res.status(200).redirect("/login");
        } else {
          req.flash("error", "Sorry you are not logged in!");
          res.status(404).render("ursl_login");
        }
      })



  module.exports = router
  