const express = require("express");
const app = express();
const PORT = 8080;

// sets the "view engine" to embedded js
app.set("view engine", "ejs");

// Middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// database containing both the shortURLs (keys) and longURLs (values)
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Jsm5xK": "http://www.google.com",
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

// handles get requests for the /hello path
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// handles get requests for the /urls path and passes along the urlDatabase obj to be rendered
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

// handles the generation of a new shortURL followed by a redirect to show you the new shortURL you created
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// presents the urls/new page containing a form to input a URL
app.get('/urls/new', (req, res) => {
  res.render("urls_new");
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
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);
});

// handles the route when a shortURL is provided and passes along an obj containing both the shortURLs and longURLs
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

// for the /u/ path it essentially redirects you to the longURL website associated with the shortURL entered as part of the get request
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// event listener for people making to our server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});