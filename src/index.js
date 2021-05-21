const express = require("express");
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("<h1>Hi there, welcome to your app</h1>");
});

app.use(express.json());
app.post("/comment", (req, res) => {
  res.send(req.body);
});

const ymlParser = express.raw({ type: "application/yml" });

app.post("/geek-comment", ymlParser, (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

app.listen(process.env.PORT, () =>
  console.log(`server running on port ${process.env.PORT}`)
);
