const express = require("express");
const morgan = require('morgan')

const app = express();
const PORT = 8080; // default port 8080
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const cookieSession = require("cookie-session");
const {urlDatabase} = require("./seeds/urlSeeds");
const methodOverride = require('method-override')

const userRoutes = require("./routes/userRoutes");
const urlRoutes = require("./routes/urlRoutes");
const {
  isLoggedIn,
} = require("./helpers");

app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use(
  express.urlencoded({
    extended: true,
  }) 
);
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],

  // Cookie Options
  maxAge: 12 * 60 * 60 * 1000 // 24 hours
}))
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(flash());


//Set locals for success and error to use throughout file
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.username = req.session.username;
  res.locals.userID = req.session.userID;
  res.locals.numVisits = req.session.numVisits;
  next();
});

//Middleware for user authorization to the different url paths
app.use((req, res, next) => {
  if (
    (req.originalUrl === "/urls" || req.originalUrl === "/") &&
    !isLoggedIn(req.session.username)
  ) {
    req.flash("error", "You must be logged in to view urls");
    return res.redirect("/login");
  } else if (
    req.originalUrl === "/urls/new" &&
    !isLoggedIn(req.session.username)
  ) {
    req.flash("error", "You must be logged in to create a url");
    return res.redirect("/login");
  } else if (
    req.originalUrl.includes("delete") &&
    !isLoggedIn(req.session.username)
  ) {
    req.flash("error", "You must be logged in to delete a url");
    return res.redirect("/login");
  } else if (
    req.originalUrl.includes("edit") &&
    !isLoggedIn(req.session.username)
  ) {
    req.flash("error", "You must be logged in to edit a url");
    return res.redirect("/login");
  } 
  else if( (req.originalUrl.includes("login") || req.originalUrl.includes("register"))&& isLoggedIn(req.session.username)) {
    return res.redirect("/urls");
  }
    next();
});

app.use("/", userRoutes);
app.use("/urls", urlRoutes);


app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Get request to a external url based on the longURL provided
app.get("/u/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if (Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    req.session.numVisits += 1;
    return res.status(301).redirect(longURL);
  } else {
    next();
  }
});

//On any pages that are not found an error will throw and redirect to the error template
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
