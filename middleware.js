const { users } = require("./seeds/userSeeds");
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
};
