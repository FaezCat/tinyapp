const express = require('express');
const app = express();
const PORT = 8080;

// sets the "view engine" to embedded js
app.set('view engine', 'ejs');


// Quick Notes for Reference
// cookie name is user_id

// 5 templates and 1 partial:
// login_page, _header partial, and register_page are self explanatory
// urls_index displays all urls aka "My URLs"
// urls_new displays the page to create a new URL
// urls_show displays an individual page per shortURL with edit functionality


// Middleware
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'user_id',
  keys: ["drinking", "java"]
}));

const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// Imported Helper Functions
const { urlsForUser, findUserByEmail } = require('./helpers');

// database containing shortURL primary keys and then longURL and userID properties per key
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
};

// database containing userID primary keys and userID (same value), email, and password properties per key
const users = {};

// a function built to generate the shortURLs aka 6 character alphanumeric strings
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

// handles get requests for the main page and reroutes you to either /login or /urls pending if you're logged in or not
app.get('/', (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

// handles get method for /login path and returns the login page or /urls if you're already logged in
app.get('/login', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect('/urls');
  } else {
    
    const templateVars = {
      userObj: users[userID],
    };
  
    res.render('login_page', templateVars);

  }
});

// handles POST login functionality: first, checks if user exists, then, checks if password matches and if so, it will then log the user in and give them an encrypted cookie
app.post('/login', (req, res) => {
  const email = req.body.email;
  const incomingTestPassword = req.body.password;

  const userDataObj = findUserByEmail(email, users);

  if (!userDataObj) {
    return res.status(403).send('User Not Found');
  }

  const storedPassword = userDataObj['password'];

  bcrypt.compare(incomingTestPassword, storedPassword)
    .then((result) => {
      if (result) {
        req.session.user_id = userDataObj['id'];
        res.redirect('/urls');
      } else {
        return res.status(401).send('Incorrect password');
      }
    });
});

// handles logout functionality - clears a user's cookies and redirects them to the login page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.clearCookie('user_id.sig');
  res.redirect('/login');
});

// generates the registration page for the /register path or redirects them if they're logged in already
app.get('/register', (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      userObj: users[userID]
    };
    res.render('register_page', templateVars);
  }
  
});

// handles the logic after a user submits their registration form: checks if either field was blank, then checks if the user already exists, and if neither condition is triggered, then it creates a new user and hashes their password
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password fields cannot be blank");
  }

  if (findUserByEmail(email, users)) {
    return res.status(400).send("User already exists");
  }

  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      users[id] = {
        id,
        email,
        password: hash,
      };
      res.redirect('/login');
    });
});

// for the /u/ path it essentially checks to see if the short URL exists and then redirects you to the longURL website accordingly
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL does not exist");
  }
  
  const longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// handles get requests for the main /urls path and first validates if you have a cookie and if that cookie matches a user in the database prior to rendering tailored shortURL page
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  
  if (!userID || !users[userID]) {
    res.send("Please login to view page");
  } else {
    
    const userURLs = {};
  
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL]["userID"] === userID) {
        userURLs[shortURL] = urlDatabase[shortURL];
      }
    }
    
    const templateVars = {
      userObj: users[userID],
      urls: userURLs,
      userID: userID
    };
    res.render('urls_index', templateVars);

  }
});

// handles the validation of a cookie + that the user exists prior to generating a new shortURL followed by a redirect to show you the new shortURL + allow editing
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  
  if (!userID || !users[userID]) {
    res.redirect('/login');
  } else {
    
    const shortURL = generateRandomString();
    
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID,
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// presents the urls/new page containing a form to input a URL and generate a short URL after validating that you have a cookie and that the user exists in the db
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  
  if (!userID || !users[userID]) {
    res.redirect('/login');
  } else {
    
    const templateVars = {
      userObj: users[userID],
    };
    
    res.render('urls_new', templateVars);

  }
});

// handles the route for deleting a shortURL from our urlDatabase and myURLs list after validating the cookie && user && permissions
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    return res.status(401).send("Please login prior to making deletion");
  } else {

    const shortURL = req.params.shortURL;

    if (!urlsForUser(userID, urlDatabase)[shortURL]) {
      return res.status(401).send("You do not have permission to delete this shortened URL");
    }
  
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

// handles the route for editing a shortURL; updates our urlDatabase and myURLs list then reroutes back to same page after validating cookie and user
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;

  if (!userID || !users[userID]) {
    res.redirect('/login');
  } else {
    const shortURL = req.params.shortURL;
      
    if (!urlsForUser(userID, urlDatabase)[shortURL]) {
      return res.status(401).send("You must login to edit this shortened URL");
    }
    
    urlDatabase[shortURL]["longURL"] = req.body.newLongURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

// handles the route when a shortURL is provided and passes along an obj containing both the shortURLs and longURLs after checking if short URL exists then that the user has the proper permissions
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("404 short URL not found");
  }

  if (!userID || !users[userID]) {
    return res.status(401).send("Please login to view shortened URL");
  } else {
    const shortURL = req.params.shortURL;
    
    if (!urlsForUser(userID, urlDatabase)[shortURL]) {
      return res.status(401).send("Shortened URL does not belong to user");
    }
    
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL]["longURL"],
      userObj: users[userID],
    };
    res.render("urls_show", templateVars);
  }
});

// event listener for requests made to the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});