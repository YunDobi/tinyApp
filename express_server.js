const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

/*
* Functions and Datas
 */
const {generateRandomString} = require("./helper");
const {urlsForUser} = require("./helper");
const {getUserByEmail} = require("./helper");
const {urlDatabase} = require("./helper");
const {users} = require("./helper");

/*
* MiddleWare
 */
app.set("view engine", "ejs");
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["key"]}));
app.use(bodyParser.urlencoded({extended: true}));

/*
* homepage and database
 */
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});
app.get("/urls.json", (req, res) => {
  res.json(users);
});

/*
* urls homepage
 */
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const output = urlsForUser(userId);

    const templateVars = {
      urls: output,
      user: users[userId],
      username: userId
    };
    res.render("urls_index", templateVars);
  }
  if (!userId) {
    return res.status(403).send("Your need to Register or Login First! go to the /longIn or /Register.");
  }
});

/*
* Create New URL in New page
 */
//Display the new page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const templateVars = {
      user: users[userId]
    };
    res.render("urls_new", templateVars);
  }
  if (!userId) {
    res.redirect("/login");
  }
  
});

//When Press the create button in new Page.
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(403).send("You are not logged In");
  }
  let short = generateRandomString();
  urlDatabase[short] = {longURL: req.body.longURL, userID: userId, visit: 0, datevisit: [Date.now()]};
  res.redirect(`/urls/${short}`);
});

/*
* detail about the URL or Edit
 */
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;

  if (!shortURL) return res.status(403).send("Invalid URL.");
  if (!userId) return res.status(403).send("You are not authorized. Login first.");

  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

// Post Edit. After pressed the edit button.
app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  const userId = req.session.user_id;
  if (!userId) {
    res.status(403).send("You are not logged In.");
  }
  if (!urlDatabase[id]) {
    res.status(400).send("The ID is not exist.");
  }

  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visit: 0,
    datevisit: [Date.now()]
  };
  res.redirect(`/urls`);
});

/*
* Delete the URL
 */
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(403).send("You are not logged In.");
  }
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("The ID is not exist.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

/*
* Login
 */
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[userId]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send("blank!");
  }
  
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("No user exist!");
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("The password is not Correct!");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

/*
* Logout
 */
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

/*
* Register
 */
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[userId] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const user = getUserByEmail(email,users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Blank!");
  }

  if (user) {
    return res.status(400).send("this email is alredy exist. Try other email.");
  }

  users[`user${id}RandomID`] = {
    id: `user${id}RandomID`,
    email: email,
    password: hashedPassword
  };
  // set a user_id cookie containing newly generated ID
  req.session.user_id = `user${id}RandomID`;
  res.redirect("/urls");
});

//link to the longURL
app.get("/u/:id", (req,res)=> {
  const id = req.params.id;
  const urlData = urlDatabase[id];
  urlData.visit += 1;
  if (!urlData) {
    res.status(404).send("ShortURL is not exist");
  }
  res.redirect(urlData.longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
