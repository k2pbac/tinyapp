const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./generateRandomString");
const flash = require("connect-flash");
const session = require("express-session");

app.use(
  express.urlencoded({
    extended: true,
  })
);
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
    // secure: true,
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
  next();
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Get route for home page
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Get and Post routes for a new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = longURL;
  req.flash("success", "Successfully Inserted a new URL!");
  res.redirect("urls");
});

//get route for short url page
app.get("/urls/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.render("urls_show", { shortURL, longURL });
  }
  next();
});

//get route for long url redirect from short url page
app.get("/u/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  }
  next();
});

app.get("*", (req, res) => {
  req.flash("error", "Sorry, page was not found!");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
