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

module.exports = {
  userExists,
  authenticateUser,
};
