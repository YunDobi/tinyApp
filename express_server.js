const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');

/*
* Functions and Datas
 */
const {generateRandomString} = require("./functions");
const {urlsForUser} = require("./functions");
const {findEmail} = require("./functions");
const {urlDatabase} = require("./functions");
const {users} = require("./functions");

/*
* MiddleWare
 */
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

/*
* homepage and database
 */
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(users);
});

/*
* urls homepage
 */
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const output = urlsForUser(userId);

    const templateVars = {
      urls: output,
      user: users[userId],
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
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

//When Press the create button in new Page.
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  let short = generateRandomString();
  urlDatabase[short] = {longURL: req.body.longURL, userID: userId};
  res.redirect(`/urls/${short}`);
});

/*
* detail about the URL or Edit
 */
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.cookies["user_id"];

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
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/${id}`);
});

/*
* Delete the URL
 */
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

/*
* Login
 */
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
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

  const user = findEmail(email);

  if (!user) {
    return res.status(403).send("No user exist!");
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("The password is not Correct!");
  }



  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

/*
* Logout
 */
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

/*
* Register
 */
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const user = findEmail(email);
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
  res.cookie('user_id', `user${id}RandomID`);
  console.log('users', users);
  res.redirect("/urls");
});

//link to the longURL
app.get("/u/:id", (req,res)=> {
  const id = req.params.id;
  const urlData = urlDatabase[id];
  if (!urlData) {
    res.status(404).send("ShortURL is not exist");
  }
  res.redirect(urlData.longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
