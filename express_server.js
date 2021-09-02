const express = require("express");
const morgan = require('morgan')

const app = express();
const PORT = 8080; // default port 8080
const flash = require("connect-flash");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const urlRoutes = require("./routes/urlRoutes");
const {
  isLoggedIn,
} = require("./middleware");


app.use(morgan('dev'));

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
    (req.originalUrl === "/urls" || req.originalUrl === "/") &&
    !isLoggedIn(req.cookies.username)
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

app.use("/", userRoutes);
app.use("/urls", urlRoutes);


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
