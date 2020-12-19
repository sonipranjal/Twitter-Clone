const express = require("express");
const app = express();
const Twitter = require("./api/helpers/twitter");
const port = 3000;
require("dotenv").config();

const twitter = new Twitter();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/tweets", (req, res) => {
  const query = req.query.q;
  const count = req.query.count;
  twitter
    .get(query, count)
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.listen(port, () => {
  console.log(`Twitter Clone app listening at http://localhost:${port}`);
});
