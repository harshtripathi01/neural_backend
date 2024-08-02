const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require('cookie-parser');
// const i18nextMiddleware = require('i18next-express-middleware'); 
const Routes = require("./routes/index.js");
const connectMongo = require("./config/dbConnection.js");
const cors = require("cors");
const path = require("path");
const { error } = require("console");

connectMongo();

dotenv.config();
const app = express();

app.use(express.json());
// app.use(cors(corsOptions));
app.use(cors());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public/upload")); // Corrected the path
app.use(express.static(path.resolve("./public")));
//console.log(Router);

app.use(Routes);

app.use(function (req, res, next) {
  res.status(404).send({ message: "No Matching route...." });
  return;
});

app.use(function (err, req, res, next) {
  console.log("err", err);
  res.status(err.status || 500);
  res.json({
    Error: { message: err.message}
  });
});

module.exports = app;