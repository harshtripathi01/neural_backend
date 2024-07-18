// server.js

const app = require("./app");
require('dotenv').config();

let port = process.env.PORT || 3000;

app.listen(port, function (err) {
  if (err) {
    console.log("Error in start server", err);
    return;
  }
  console.log(`your app is running on Port : ${port}`);
});
