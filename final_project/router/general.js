const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if(username && password && isValid(username)) {
    users.push({"username":username,"password":password});
    return res.status(200).json({message: "User successfully registred."});
  }
  else{
    return res.status(404).json({message: "User already exists!"});
  }
});

public_users.get('/',async function(req, res) {

  return new Promise((resolve, reject) => {
    resolve(res.status(300).json(books));
  });
 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  return new Promise((resolve, reject) => {
    const isbn = req.params.isbn
    const book = books[isbn]
    resolve(res.status(300).json(book));
})
});
// Get book details based on author

public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase(); // Normalize author name
  
  console.log(author);
  try {
    const response = await axios.get('http://localhost:5000/books'); 
    const booksByAuthor = Object.values(response.data).filter(book => book.author.toLowerCase() === author);
    if (booksByAuthor.length > 0) {
      return res.status(200).json({"booksByAuthor" : booksByAuthor});
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try{
    const response = await axios.get('http://localhost:5000/books');
    const bookList = Object.values(response.data).filter(book => book.title.toLowerCase() === title);
  
  if (bookList.length > 0) {
      return res.status(300).json(bookList);
  } else {
      return res.status(404).json({ message: "No books found with this title" });
  }
  }catch(error){
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        return res.status(300).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
