// app.js

const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require('cookie-parser');
const Routes = require("./routes/index.js");
const sequelize = require("./config/dbConnection.js");
const cors = require("cors");
const path = require("path");
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(__dirname + "/public/upload")); // Corrected the path
app.use(express.static(path.resolve('./public')));

app.use(Routes);

app.use(function (req, res, next) {
  res.status(404).send({ message: "No Matching Route Please Check Again...!!" });
  return;
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    Error: {
      message: err.message,
    },
  });
});

// Sync Sequelize models and start the server
sequelize.sync().then(() => {
  console.log('Database synchronized successfully.');
}).catch((error) => {
  console.error('Error synchronizing database:', error);
});

module.exports = app;
