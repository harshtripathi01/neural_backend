const multer = require("multer");

const path = require("path");

const crypto = require("crypto");


const flagupload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload/"); // public file upload
  },
  filename: function (req, file, cb) {
    const uniqueHash = crypto.randomBytes(4).toString("hex"); // Generate a short unique hash
    const fileNameWithoutExt = path.parse(file.originalname).name.toLowerCase().split(' ').join('-');
    const extension = path.extname(file.originalname);
    cb(null, fileNameWithoutExt + "-" + uniqueHash + extension);
  },
});

const upload = multer({
  storage: flagupload,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

module.exports = upload;
