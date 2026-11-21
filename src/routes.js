const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const router = express.Router();
const databasePath = path.join(__dirname, "..", "data", "database.json");

async function readDatabase() {
  const contents = await fs.readFile(databasePath, "utf8");
  const database = JSON.parse(contents);

  if (!Array.isArray(database.posts)) {
    throw new Error("The database must contain a posts array.");
  }

  return database;
}

async function writeDatabase(database) {
  const contents = `${JSON.stringify(database, null, 2)}\n`;
  await fs.writeFile(databasePath, contents, "utf8");
}

function getText(value, maxLength) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

router.get("/", async (req, res) => {
  const database = await readDatabase();
  res.render("feeds/index", { posts: database.posts });
});

router.get("/api/posts", async (req, res) => {
  const database = await readDatabase();
  res.json(database.posts);
});

router.get("/posts/new", (req, res) => {
  res.render("posts/new");
});

router.post("/posts", async (req, res) => {
  const author = getText(req.body.author, 80);
  const title = getText(req.body.title, 160);
  const body = getText(req.body.body, 10000);

  if (!author || !title || !body) {
    return res.status(400).send("Please provide a name, title, and post.");
  }

  const database = await readDatabase();
  const post = {
    id: randomUUID(),
    title,
    body,
    author,
    createdAt: new Date().toISOString(),
    comments: [],
  };

  database.posts.unshift(post);
  await writeDatabase(database);
  res.redirect(303, `/posts/${encodeURIComponent(post.id)}`);
});

router.get("/posts/:id", async (req, res) => {
  const database = await readDatabase();
  const post = database.posts.find((item) => item.id === req.params.id);

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  res.render("posts/show", { post });
});

router.post("/posts/:id/comments", async (req, res) => {
  const author = getText(req.body.author, 80);
  const body = getText(req.body.body, 5000);

  if (!author || !body) {
    return res.status(400).send("Please provide your name and a comment.");
  }

  const database = await readDatabase();
  const post = database.posts.find((item) => item.id === req.params.id);

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  post.comments = post.comments || [];
  post.comments.push({
    author,
    body,
    createdAt: new Date().toISOString(),
  });

  await writeDatabase(database);
  res.redirect(303, `/posts/${encodeURIComponent(post.id)}`);
});

module.exports = router;
