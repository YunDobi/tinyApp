const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  let out = "";
  let value = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let distance = 6;
  for (let i = 0; i < distance; i ++) {
    out += value.charAt(Math.floor(Math.random() * value.length));
  }
  return out;
};

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "random": {
    id: "random",
    email: "user@example.com",
    password: "123"
  }
};

let randomID = generateRandomString();


app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});//html file with boldlongURL

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;

  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

//adding post
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

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
  // console.log(email,password);
  if (!email || !password) {
    return res.status(403).send("blank!");
  }
  const user = findEmail(email);
  if (!user) {
    return res.status(403).send("No user exist!");
  }
  if (user.password !== password) {
    return res.status(403).send("The password is not Correct!");
  }


  res.cookie('user_id', user.id);
  console.log('users', users);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    user: users[userId] };
  res.render("register", templateVars);
});

const findEmail = (email) => {
  for (let userID in users) {
    const user = users[userID];
    if (users[userID].email === email) {
      return user;
    }
  }
};

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  
  if (!email || !password) {
    return res.status(400).send("Blank!");
  }

  const user = findEmail(email);
  if (user) {
    return res.status(400).send("this email is alredy exist. Try other email.");
  }

  users[`user${id}RandomID`] = {
    id: `user${id}RandomID`,
    email: email,
    password: password
  };
  // set a user_id cookie containing newly generated ID
  res.cookie('user_id', `user${id}RandomID`);
  console.log('users', users);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
