const express = require('express');
const app = express();
const PORT = 8080;

// sets the "view engine" to embedded js
app.set('view engine', 'ejs');

// Quick Notes for Reference
// 3 view pages:
// urls_index view page displays all urls aka "My URLs"
// urls_new view page displays the page to create a new URL
// urls_show view page displays an individual page per shortURL with edit func

// Middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// database containing both the shortURLs (keys) and longURLs (values)
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Jsm5xK": "http://www.google.com",
};

// database containing all user data + a simple example for reference
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

// function to search our users database by an email parameter (literally an email); it returns an object containing the user's data
const findUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID]["email"] === email) {
      return users[userID];
    }
  }
  return null;
};

// a function built to generate the shortURL aka a 6 character alphanumeric value
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

// handles get requests for the main page and reroutes you to the /urls/ page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// handles get method for /login path and returns the login page
app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    userObj: users[userID],
  };
  res.render('login_page', templateVars);
});

// handles POST login functionality - NEEDS TO BE UPDATED
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

// handles logout functionality - clears a user's cookie and redirects to main page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// generates the registration page for the /register path
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    userObj: users[userID]
  };
  res.render('register_page', templateVars);
});

// handles the logic after a user submits their registration form: checks if either field was blank, then checks if the user already exists, and if neither condition is triggered, then it creates a new user and assigns a cookie with the new user_id
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password fields cannot be blank");
  }

  if (findUserByEmail(email)) {
    return res.status(400).send("User already exists");
  }

  users[id] = {
    id: id,
    email: email,
    password: password
  };

  res.cookie('user_id', users[id].id);
  res.redirect('/urls');
});

// for the /u/ path it essentially redirects you to the longURL website associated with the shortURL entered as part of the get request
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// handles get requests for the /urls path and passes along the urlDatabase obj to be rendered
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    userObj: users[userID],
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// handles the generation of a new shortURL followed by a redirect to show you the new shortURL you created
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// presents the urls/new page containing a form to input a URL
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    userObj: users[userID],
  };
  res.render('urls_new', templateVars);
});

// handles the route for deleting a shortURL from our urlDatabase and myURLs list
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// handles the route for editing a shortURL; updates our urlDatabase and myURLs list then reroutes back to same page
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect(`/urls/${shortURL}`);
});

// handles the route when a shortURL is provided and passes along an obj containing both the shortURLs and longURLs
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userObj: users[userID],
  };
  res.render("urls_show", templateVars);
});

// event listener for requests made to our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});