const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { urlDatabase } = require("./seeds/urlSeeds");
const { users } = require("./seeds/userSeeds");
const { v4: uuidv4 } = require("uuid");
const {
  userExists,
  authenticateUser,
  generateRandomString,
  isLoggedIn,
} = require("./middleware");
const e = require("connect-flash");
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
//Create a session config and call both flash and session to use methods
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
};
app.use(flash());
app.use(session(sessionConfig));

//Set locals for success and error to use throughout file
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.username = req.cookies.username;
  res.locals.userID = req.cookies.userID;
  next();
});

app.use((req, res, next) => {
  if (
    req.originalUrl === "/urls" ||
    (req.originalUrl === "/" && !isLoggedIn(req.cookies.username))
  ) {
    req.flash("error", "You must be logged in to view urls");
    res.redirect("/login");
  } else if (
    req.originalUrl === "/urls/new" &&
    !isLoggedIn(req.cookies.username)
  ) {
    req.flash("error", "You must be logged in to create a url");
    res.redirect("/login");
  } else if (
    req.originalUrl.includes("delete") &&
    !isLoggedIn(req.cookies.username)
  ) {
    req.flash("error", "You must be logged in to delete a url");
    res.redirect("/login");
  } else if (
    req.originalUrl.includes("edit") &&
    !isLoggedIn(req.cookies.username)
  ) {
    req.flash("error", "You must be logged in to edit a url");
    res.redirect("/login");
  } else {
    next();
  }
});

//Get route for home page
app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// Get and Post routes for a new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies.username });
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  if (isLoggedIn(req.cookies.username)) {
    if (longURL !== "") {
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = {
        longURL,
        userID: req.cookies.userID,
      };
      console.log(urlDatabase);
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

//get route for short url page
app.get("/urls/:shortURL", (req, res, next) => {
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
});

//get route for long url redirect from short url page
app.get("/u/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.status(301).redirect(longURL);
  } else {
    next();
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    delete urlDatabase[shortURL];
    req.flash("success", `You have successfully deleted the URL`);
    res.redirect("/");
  } else {
    req.flash("error", "Sorry there is no item with that url to delete!");
    res.redirect("/");
  }
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    req.flash("error", "Sorry that URL doesn't exist!");
    res.redirect("/");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { updatedURL } = req.body;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    urlDatabase[shortURL].longURL = updatedURL;
    req.flash("success", "Updated url successfully!");
    res.redirect(`/urls/${shortURL}`);
  } else {
    req.flash("error", "Sorry there is no item with that url to update!");
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password);
  if (user) {
    req.flash("success", "You have succesfully logged in!");
    res.cookie("username", email);
    res.cookie("userID", user.id);
    res.redirect("/urls");
  } else {
    req.flash("error", "Please enter a valid username and/or password");
    res.redirect("back");
  }
});

app.post("/logout", (req, res) => {
  if (req.cookies.username) {
    res.clearCookie("username");
    res.clearCookie("userID");
    req.flash("success", "Successfully logged out!");
    res.redirect("/");
  } else {
    req.flash("error", "Sorry you are not logged in!");
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
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

app.get("*", (req, res) => {
  req.flash("error", "Sorry, page was not found!");
  res.status(404).redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
