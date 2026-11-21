const express = require("express");
const app = express();
app.set("view engine", "ejs");
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get('/', (req, res) => {
    res
})