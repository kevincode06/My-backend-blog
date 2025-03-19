const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const util = require("util");
const Joi = require("joi");

dotenv.config(); // 

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend to access API
app.use(express.json());

// Database connection pool
const db = mysql.createPool({ 
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Convert db.query into a promise-based function
const query = util.promisify(db.query).bind(db);

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Validation Schema using Joi
const postSchema = Joi.object({
  name: Joi.string().min(2).required(),
  surname: Joi.string().min(2).required(),
  title: Joi.string().min(3).required(),
  content: Joi.string().min(5).required(),
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await query("SELECT * FROM posts");
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Add a new post
app.post("/posts", async (req, res) => {
  try {
    // Validate request body
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, surname, title, content } = req.body;
    const sql = "INSERT INTO posts (name, surname, title, content) VALUES (?, ?, ?, ?)";
    
    const result = await query(sql, [name, surname, title, content]);
    res.json({ message: "Post added successfully", postId: result.insertId });

  } catch (err) {
    console.error("Error inserting post:", err);
    res.status(500).json({ message: "Error inserting post", error: err });
  }
});

// Delete a post
app.delete("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid post ID is required" });
    }

    const checkSql = "SELECT * FROM posts WHERE id = ?";
    const post = await query(checkSql, [id]);

    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const deleteSql = "DELETE FROM posts WHERE id = ?";
    await query(deleteSql, [id]);

    res.json({ message: "Post deleted successfully" });

  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post", error: err });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
