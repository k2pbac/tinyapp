const express = require("express");
const router = express.Router();
const { urlDatabase } = require("../seeds/urlSeeds");
const {
  generateRandomString,
  isLoggedIn,
  urlsForUser,
} = require("../middleware");
const {users} =require("../seeds/userSeeds")
//Routes for url index and creating a new url
router.route("/")
.get((req, res) => {
    const filteredUrls = urlsForUser(req.session.userID, urlDatabase);
    const templateVars = {
      urls: filteredUrls,
    };
    res.render("urls_index", templateVars);
  })
.post((req, res) => {
    const { longURL } = req.body;
    if (isLoggedIn(req.session.username)) {
      if (longURL !== "http://") {
        const shortURL = generateRandomString();
        urlDatabase[shortURL] = {
          longURL,
          userID: req.session.userID,
        };
        req.flash("success", "Successfully Inserted a new URL!");
        return res.status(200).redirect(`urls/${shortURL}`);
      }
      req.flash("error", "Incorrect or empty URL, nothing created!");
       return res.status(400).redirect("urls/new");
    }
     return res.redirect("/login");
    
  });

  //New url get route
  router.get("/new", ((req, res) => {
    return res.render("urls_new", { username: req.session.username });
  }));


  //Get and POST route for short url edit and show page
  router.route("/:shortURL")
  .get((req, res, next) => {
    const { shortURL } = req.params;
    if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
      const longURL = urlDatabase[shortURL].longURL;
      res.status(200).render("urls_show", {
        shortURL,
        longURL,
        postID: urlDatabase[shortURL].userID,
      });
    } else {
      next();
    }
  })
  .post((req, res) => {
    const { shortURL } = req.params;
    const { updatedURL } = req.body;
    if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL) && updatedURL !== "" && (updatedURL.includes("http://") || updatedURL.includes("https://"))) {
      urlDatabase[shortURL].longURL = updatedURL;
      req.flash("success", "Updated url successfully!");
      return res.redirect(`/urls/${shortURL}`);
    } 
      req.flash("error", "Sorry the url you entered is empty or incorrect.");
      return res.redirect("back");

  });


router.post("/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    delete urlDatabase[shortURL];
    req.flash("success", `You have successfully deleted the URL`);
    return res.redirect("/urls");
  }
    req.flash("error", "Sorry there is no item with that url to delete!");
    return res.redirect("/urls");
});

router.get("/:shortURL/edit", (req, res) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    return res.redirect(`/urls/${shortURL}`);
  }
    req.flash("error", "Sorry that URL doesn't exist!");
    return res.status(404).redirect("/urls");
});


module.exports = router;