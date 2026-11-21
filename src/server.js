const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes"));

app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).send("Something went wrong.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
