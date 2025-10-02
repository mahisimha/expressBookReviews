const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    // Extract the username and password from the request body
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Unable to register. Username and/or password not provided." });
    }
    if (!isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Create a new promise that resolves with the books object
  let getBooksPromise = new Promise((resolve, reject) => {
    // We are simulating an async operation, so we resolve immediately with our books data
    if (books) {
      resolve(books);
      console.log("with promiise callback");
    } else {
      reject("Book list not found");
    }
  });

  // Handle the promise
  getBooksPromise.then((bookList) => {
    // On success, send the book list as a JSON response
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  }).catch((err) => {
    // On failure, send an error message
    return res.status(500).json({ message: "An error occurred", error: err });
  });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Create a new promise
  let getBookDetailsPromise = new Promise((resolve, reject) => {
    const book = books[isbn]; // Find the book by its ISBN key
    if (book) {
      resolve(book); // If found, resolve the promise with the book details
    } else {
      reject("Book not found"); // If not found, reject the promise
    }
  });

  // Handle the promise
  getBookDetailsPromise.then((bookDetails) => {
    return res.status(200).send(JSON.stringify(bookDetails, null, 4));
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});

  
// Get book details based on author
// This is the correct, full function that will work.


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  
  let getBooksByAuthorPromise = new Promise((resolve, reject) => {
    const allBooks = Object.values(books);
    const filteredBooks = allBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found for this author");
    }
  });

  getBooksByAuthorPromise.then((bookDetails) => {
    return res.status(200).json(bookDetails);
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  let getBooksByTitlePromise = new Promise((resolve, reject) => {
    const allBooks = Object.values(books);
    const filteredBooks = allBooks.filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  });

  getBooksByTitlePromise.then((bookDetails) => {
    return res.status(200).json(bookDetails);
  }).catch((err) => {
    return res.status(404).json({ message: err });
  });
});
//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // 1. Get the ISBN from the URL parameter
    const isbn = req.params.isbn;
    const book = books[isbn];
    // 3. Check if the book was found
    if (book) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Book with that ISBN not found." });
    }
});
module.exports.general = public_users;
