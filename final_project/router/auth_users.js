const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
     let userFound = users.find((user) => {
        return user.username === username;});
        if(userFound){
         return false;
        }else{
            return true;
        }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let result = users.find((user)=>{
    if(user.username === username && user.password === password){
       console.log("authetictaed true");
        return true; 
    }else{console.log("authetictaed false");
    return false;
        }
}) ;
return result;
};
//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        console.log("entred if statement");
        let user = {
            username: username
        };
        console.log("user = username done");
        let accessToken = jwt.sign(user, "access", { expiresIn: 60 * 60 });
        console.log("created jwt token for user using access");
        req.session.authorization = {
            accessToken,
            username
        };
        console.log("before return statement");
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // 1. Get the ISBN from the URL parameter
    const isbn = req.params.isbn;

    // 2. Get the new review from the request query
    const review = req.body.review;

    // 3. Get the username from the session
    const username = req.session.authorization.username;

    // 4. Check if the book exists in the database
    if (books[isbn]) {
        // Access the reviews object for this book
        let reviews = books[isbn].reviews;

        // 5. Check if the user has already posted a review for this book
        if (reviews.hasOwnProperty(username)) {
            // If the user's review exists, modify the existing review
            reviews[username] = review;
            return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} has been updated.` });
        } else {
            // If the user's review does not exist, add a new one
            reviews[username] = review;
            return res.status(201).json({ message: `Review for ISBN ${isbn} by user ${username} has been added.` });
        }
    } else {
        // If the book does not exist, send a 404 Not Found error
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});
// delete a book review
// In auth_users.js

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Get the ISBN from the request parameters
    const isbn = req.params.isbn;
    // Get the username from the session
    const username = req.session.authorization.username;

    // Check if the book exists
    if (books[isbn]) {
        // Check if the user has a review for this book
        if (books[isbn].reviews[username]) {
            // Delete the user's review
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: `Review for the book with ISBN ${isbn} posted by ${username} has been deleted.` });
        } else {
            // If the user hasn't reviewed this book, return an error
            return res.status(404).json({ message: `No review found for user ${username} on this book.` });
        }
    } else {
        // If the book is not found, return an error
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
