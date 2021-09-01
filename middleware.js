const { users } = require("./seeds/userSeeds");
const { urlDatabase } = require("./seeds/urlSeeds");
const values = Object.values(users);

const userExists = (email) => {
  if (!values.find((x) => x["email"] === email)) {
    return false;
  }
  return true;
};

const authenticateUser = (email, password) => {
  let user = values.find(
    (x) => x["email"] === email && x["password"] === password
  );
  if (user) {
    return user;
  }
  return undefined;
};

const isLoggedIn = (user) => {
  if (user) {
    return true;
  }
  return false;
};

const urlsForUser = (id) => {
  const finalURLs = {};
  const urls = Object.entries(urlDatabase)
    .filter((x) => x[1].userID === id)
    .map(
      (el) =>
        (finalURLs[el[0]] = { longURL: el[1].longURL, userID: el[1].userID })
    );
  return finalURLs;
};

const generateRandomString = () => {
  return (Math.random() + 1)
    .toString(36)
    .substring(7)
    .split("")
    .map((el, index) =>
      typeof el === "string" && index % 2 !== 0 ? el.toUpperCase() : el
    )
    .join("");
};

module.exports = {
  userExists,
  authenticateUser,
  generateRandomString,
  isLoggedIn,
  urlsForUser,
};
