const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose"); //import mongoose module

function connectMongo() {
  try {
    mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", () => {
      console.log(":::connected to database:::");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("disconnected to database");
    });

    //event to catch error in the database connection

    mongoose.connection.on("error", (err) => {
      console.log("error in conn", err);
    });
  } catch (error) {
    console.log("db connection error:::", error);
  }
}

module.exports = connectMongo;
