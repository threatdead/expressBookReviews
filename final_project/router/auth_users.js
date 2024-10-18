const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid

if (username){
  if (users.filter((user) => {return user.username === username}).length > 0){
    return false;
  }
  else{
    return true;
  }
}
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  const user = users.filter((user) => {return user.username === username && user.password === password});

  if (user.length > 0){
    return true;
  }
  else{
    return false;
  }
}

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (!book) {
      return res.status(404).json({message: "Book not found"});
  }

  let review = req.body.review;
  let username = req.session.authorization['username'];

  // Check if book already has reviews
  if (!book['reviews']) {
      book['reviews'] = {};  // Initialize if not present
  }

  // Add or update review for the user
  book['reviews'][username] = review;

  res.status(200).json({message: `Review added/updated for the book with ISBN ${isbn}`});
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (!book) {
      return res.status(404).json({message: "Book not found"});
  }

  let username = req.session.authorization['username'];

  if (book['reviews'] && book['reviews'][username]) {
      delete book['reviews'][username];
      return res.status(200).json({message: `Review for the ISBN ${isbn} posted by the user ${username} has been deleted`});
  } else {
      return res.status(404).json({message: "Review not found"});
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
