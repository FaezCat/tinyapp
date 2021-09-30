// function to return an object containing all the shortURLs that match a user_id
const urlsForUser = (id, database) => {
  let matchingURLs = {};

  for (const url in database) {
    if (database[url]["userID"] === id) {
      matchingURLs[url] = url;
    }
  }
  return matchingURLs;
};

// function to search our users database by an email parameter (literally an email); it returns an object containing the user's data
const findUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID]["email"] === email) {
      return database[userID];
    }
  }
  return null;
};

module.exports = { 
  urlsForUser, 
  findUserByEmail 
};