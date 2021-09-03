const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

const {
  userExists,
  authenticateUser,
} = require("../helpers");
const { users } = require("../seeds/userSeeds");
const { v4: uuidv4 } = require("uuid");

router.route("/register")
  .get((req, res) => {
    return res.render("urls_register");
  })
  .post((req, res) => {
    const { email, password } = req.body;
  
    if(email) {
    if (!userExists(email, users)) {
      if(password) {
      const hashedPassword = bcrypt.hashSync(password, 10);

      console.log(hashedPassword);
      let id = uuidv4();
      users[id] = { id, email, password: hashedPassword };
      req.session.username = email;
      req.session.userID = id;
      req.flash("success", "Welcome to TinyApp, you are now registered!");
      return res.status(200).redirect("/urls");
      }
      req.flash("error", "Fields can't be empty");
      return res.status(401).redirect("/register");
    } 
    req.flash("error", "A user with this email already exists.");
    return res.status(400).redirect("/register");
  }
  req.flash("error", "Fields can't be empty")
  return res.status(400).redirect("/register");
  });


  router.route("/login")
    .get((req, res) => {
     return res.status(200).render("urls_login");
    })
    .post((req, res) => {
      const { email, password } = req.body;
      const user = authenticateUser(email, password, users);
      if (user) {
        req.flash("success", "You have succesfully logged in!");
        req.session.username = email;
        req.session.userID = user.id;
        return res.status(200).redirect("/urls");
      } 
        req.flash("error", "Please enter a valid username and/or password");
        return res.status(401).redirect("back");
    });

    router.post("/logout", (req, res) => {
        if (req.session.username) {
          req.session.username = null;
          req.session.userID = null;
          req.flash("success", "Successfully logged out!");
          return res.status(200).redirect("/login");
        } 
          req.flash("error", "Sorry you are not logged in!");
          return res.status(404).redirect("back");
      })



  module.exports = router
  