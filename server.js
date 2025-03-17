const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database Connected!");
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Get all posts
app.get("/posts", (req, res) => {
  const sql = "SELECT * FROM posts";
  db.query(sql, (err, result) => { 
    if (err) throw err;
    res.send(result);
  });
});

// Add a new post
app.post("/posts", (req, res) => {
  const { name, surname, title, content } = req.body;
  if (!name || !surname || !title || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO posts (name, surname, title, content) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, surname, title, content], (err, result) => {
    if (err) {
      console.error("Error inserting post:", err);
      return res.status(500).json({ message: "Error inserting post", error: err });
    }
    res.json({ message: "Post added successfully", postId: result.insertId });
  });
});

// Delete a post
app.delete("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id); // Convert to number
  console.log("Deleting post with id:", id);

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid post id is required" });
  }

  const checkSql = "SELECT * FROM posts WHERE id = ?";
  db.query(checkSql, [id], (err, result) => {
    if (err) {
      console.error("Error checking post:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.length === 0) {
      console.log(`Post with id: ${id} not found.`);
      return res.status(404).json({ message: "Post not found" });
    }

    const deleteSql = "DELETE FROM posts WHERE id = ?";
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error("Error deleting post:", err);
        return res.status(500).json({ message: "Error deleting post", error: err });
      }
      res.json({ message: "Post deleted successfully" });
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
