const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// sets the "view engine" to embedded js
app.set("view engine", "ejs");

// database containing both the shortURLs (keys) and longURLs (values)
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

// handles get requests for the main page
app.get('/', (req, res) => {
  res.send("Hello!");
});

// handles get requests for the /hello path
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// handles get requests for the /urls path and passes along the urlDatabase obj to be rendered
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// presents the urls/new page containing a form to input a URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// currently unclear use 
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// handles the path when a shortURL is provided and passes along an obj containing both the shortURLs and longURLs
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

// event listener for people connecting to our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});