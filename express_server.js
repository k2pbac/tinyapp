const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {generateRandomString} = require("./generateRandomString");
const utf8 = require("utf8");

app.use(express.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Get route for home page
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


// Get and Post routes for a new url 
app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.post("/urls", (req, res) => {
  const {longURL} = req.body;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect("urls");
});


//get route for short url page
app.get("/urls/:shortURL", (req, res, next) => {
  const { shortURL } = req.params;
  if(Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
  const longURL = urlDatabase[shortURL]
  res.render('urls_show', {shortURL, longURL});
  }
  next()
});

//get route for long url redirect from short url page
app.get("/u/:shortURL", (req, res, next) => {
  const {shortURL} = req.params;
  if(Object.prototype.hasOwnProperty.call(urlDatabase, shortURL)) {
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
  }
  next()
});

app.get('*', (req, res) => {

  res.send("sorry page doesn't exist");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});