
const app = require("./app");


let port = process.env.APP_PORT || 9876;

 

app.listen(port, function (err) {

  if (err) {

    console.log("Error in start server", err);

    return;

  }

  console.log(`your app is running on Port : ${port}`);

});