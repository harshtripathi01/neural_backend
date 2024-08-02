const express = require("express");
const upload = require("../middleware/multer");
const uploads = require("../controller/uploadImage.js");

const router = express.Router();

router.post("/uploadImage", upload.single("image"), uploads.uploadImage)

module.exports = router;