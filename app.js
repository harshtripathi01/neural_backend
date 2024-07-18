const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require('cookie-parser');
// const i18nextMiddleware = require('i18next-express-middleware'); 
const Routes = require("./routes/index.js");
const connectMongo = require("./config/dbConnection.js");
const cors = require("cors");
const path = require("path");

connectMongo();

dotenv.config();

const app = express();

// app.use(cookieParser());

// Initialize i18next and configure it
// const i18next = require('i18next');
// i18next
//   .use(i18nextMiddleware.LanguageDetector)
//   .init({
//     resources: {
//       en: { translation: { hello: 'Hello' } },
//       hi: { translation: { hello: 'नमस्ते' } }
//     },
//     fallbackLng: 'en',
//     debug: true
//   });

// app.use(i18nextMiddleware.handle(i18next));
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

// app.use((req, res, next) => {
//   // ... Your CORS configuration
//   next();
// });

// app.use((req, res, next) => {
//   // ... Your logging configuration
//   next();
// });

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

module.exports = app;
