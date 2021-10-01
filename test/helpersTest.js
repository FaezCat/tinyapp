const { assert } = require('chai');

const { urlsForUser, findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  C6UTxX: {
    longURL: "https://www.cbc.ca",
    userID: "Bb58lW"
  },
  b7UTxX: {
    longURL: "https://www.example.com",
    userID: "aJ48lW"
  },
};

describe('findUserByEmail', function() {
  it('should return an object containing the information of the user who owns the email provided', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput, "the function worked!");
  });
});

describe('urlsForUser', function() {
  it('should return an object containing the shortURLs that belong to that specific user', function() {
    const user = urlsForUser("aJ48lW", urlDatabase)
    const expectedOutput = { 
      b6UTxQ: "b6UTxQ", 
      b7UTxX: "b7UTxX" };
    assert.deepEqual(user, expectedOutput, "the function worked!");
  });
});