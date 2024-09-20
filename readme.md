# 📚 The Reading Ledger

## Overview

This project helps organize and store notes on books you've read, inspired by Derek Sivers' book notes site. It allows users to add books, take notes, edit a note, delete a note, rate them, and sort them by title, rating, or recency. The app integrates the **Open Library Covers API** for fetching book covers and uses **PostgreSQL** for database persistence, with full CRUD functionality.

## Objectives

- Integrate public APIs (like Open Library Covers) into a web application.
- Use **Express/Node.js** for server-side programming.
- Persist book data using **PostgreSQL** and perform CRUD operations (Create, Read, Update, Delete).

## Features

- 📖 Store and manage book details (title, authors, isbn, notes, rating, read date).
- 🖼 Fetch book covers via the Open Library Covers API.
- 🔍 Sort books by rating, title, or recency.
- ✏️ Full CRUD operations to add, edit, or delete books.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AbakarLol/Reading-Ledger.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up a PostgreSQL database;
   
4. Start the server:
   ```bash
   nodemon index.js
   ```

## Dependencies

- **Node.js**, **Express.js**, **pg**, **EJS**, **Axios**, **PostgreSQL**

## Contribution

Feel free to fork, improve, or submit pull requests!

---

