const express = require("express");
const router = express.Router();
const { urlDatabase } = require("../seeds/urlSeeds");
const {
  generateRandomString,
  isLoggedIn,
  urlsForUser,
} = require("../middleware");

//Routes for url index and creating a new url
router.route("/")
.get((req, res) => {
    const filteredUrls = urlsForUser(req.cookies.userID);
    const templateVars = {
      urls: filteredUrls,
    };
    res.render("urls_index", templateVars);
  })
.post((req, res) => {
    const { longURL } = req.body;
    if (isLoggedIn(req.cookies.username)) {
      if (longURL !== "http://") {
        const shortURL = generateRandomString();
        urlDatabase[shortURL] = {
          longURL,
          userID: req.cookies.userID,
        };
        req.flash("success", "Successfully Inserted a new URL!");
        res.status(200).redirect(`urls/${shortURL}`);
      } else {
        req.flash("error", "Incorrect or empty URL, nothing created!");
        res.redirect("urls/new");
      }
    } else {
      res.redirect("/login");
    }
  });

  //New url get route
  router.get("/new", ((req, res) => {
    res.render("urls_new", { username: req.cookies.username });
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
      res.redirect(`/urls/${shortURL}`);
    } else {
      req.flash("error", "Sorry the url you entered is empty or incorrect.");
      res.redirect("back");
    }
  });


//get route for long url redirect from short url page
router.get("/u/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.status(301).redirect(longURL);
  } else {
    next();
  }
});


router.post("/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    delete urlDatabase[shortURL];
    req.flash("success", `You have successfully deleted the URL`);
    res.redirect("/urls");
  } else {
    req.flash("error", "Sorry there is no item with that url to delete!");
    res.redirect("/urls");
  }
});

router.get("/:shortURL/edit", (req, res) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    req.flash("error", "Sorry that URL doesn't exist!");
    res.redirect("/urls");
  }
});


module.exports = router;