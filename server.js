const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Joi = require("joi");
const { query } = require("./db");  // Importing query from db.js

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Validation Schema using Joi
const postSchema = Joi.object({
  name: Joi.string().min(2).required(),
  surname: Joi.string().min(2).required(),
  title: Joi.string().min(3).required(),
  content: Joi.string().min(5).required(),
});

// ✅ Get All Posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await query("SELECT * FROM posts");
    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts", error: err });
  }
});

// ✅ Add a New Post
app.post("/posts", async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, surname, title, content } = req.body;
    const sql = "INSERT INTO posts (name, surname, title, content) VALUES (?, ?, ?, ?)";
    
    const result = await query(sql, [name, surname, title, content]);
    res.json({ message: "✅ Post added successfully", postId: result.insertId });

  } catch (err) {
    console.error("❌ Error inserting post:", err);
    res.status(500).json({ message: "Error inserting post", error: err });
  }
});

// ✅ Delete a Post
app.delete("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "❌ Valid post ID is required" });
    }

    const checkSql = "SELECT * FROM posts WHERE id = ?";
    const post = await query(checkSql, [id]);

    if (post.length === 0) {
      return res.status(404).json({ message: "❌ Post not found" });
    }

    const deleteSql = "DELETE FROM posts WHERE id = ?";
    await query(deleteSql, [id]);

    res.json({ message: "✅ Post deleted successfully" });

  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post", error: err });
  }
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});