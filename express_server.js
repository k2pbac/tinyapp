const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./generateRandomString");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.set("view engine", "ejs");

//Create a session config and call both flash and session to use methods
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(flash());
app.use(session(sessionConfig));

//Set locals for success and error to use throughout file
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.cookie("username", "");
  res.locals.username = req.cookies.username;
  // if (req.session.username) {
  //   res.locals.username = req.session.username;
  // } else {
  //   res.locals.username = "";
  // }
  next();
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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

  if (longURL !== "") {
    const shortURL = generateRandomString();

    urlDatabase[shortURL] = longURL;
    req.flash("success", "Successfully Inserted a new URL!");
    res.status(200).redirect(`urls/${shortURL}`);
  } else {
    req.flash("error", "Incorrect or empty URL, nothing created!");
    res.redirect("urls/new");
  }
});

//get route for short url page
app.get("/urls/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.status(200).render("urls_show", {
      shortURL,
      longURL,
    });
  } else {
    next();
  }
});

//get route for long url redirect from short url page
app.get("/u/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL];
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
    urlDatabase[shortURL] = updatedURL;
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
  const { username } = req.body;
  if (!username.length) {
    req.flash("error", "Please enter a valid username");
    res.redirect("/urls");
  } else {
    req.flash("success", "You have succesfully logged in!");
    // req.session.username = username;
    res.cookie("username", username);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  // if (req.session.username) {
  //   req.session.username = "";
  //   req.flash("success", "Successfully logged out!");
  //   res.redirect("/");
  // }
  if (req.cookies.username) {
    res.clearCookie("username");
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

app.get("*", (req, res) => {
  req.flash("error", "Sorry, page was not found!");
  res.status(404).redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
