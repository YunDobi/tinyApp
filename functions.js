const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  }
};

const generateRandomString = () => {
  let out = "";
  let value = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let distance = 6;
  for (let i = 0; i < distance; i ++) {
    out += value.charAt(Math.floor(Math.random() * value.length));
  }
  return out;
};

const urlsForUser = (id) => {
  let out = {};
  for (let i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      out[i] = urlDatabase[i];
    }
  }
  return out;
};

const findEmail = (email) => {
  for (let userID in users) {
    const user = users[userID];
    if (users[userID].email === email) {
      return user;
    }
  }
};



module.exports = {urlDatabase, users, generateRandomString, urlsForUser,findEmail};
