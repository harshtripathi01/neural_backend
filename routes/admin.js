const express = require("express");
const admin = require("../controller/admin.js")

const router = express.Router();
router.post("/createAdmin", admin.createAdmin);

router.get("/getAllAdmin", admin.getAllAdmin);

router.get("/getAdmin/:id", admin.getAdmin);

router.put("/updateAdmin/:id", admin.updateAdmin);

router.delete("/deleteAdmin/:id", admin.deleteAdmin);

router.post("/signup", admin.signup);

router.post("/login", admin.login);

router.post("/verifiedWithEmail",admin.verifiedWithEmail);

router.post("/resendOtpEmail",admin.resendOtpEmail);

router.post("/forgotPassword", admin.forgotPassword);

router.post("/changePassword", admin.changePassword);

module.exports = router