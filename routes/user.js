const express = require("express");
const user = require("../controller/user.js");
 
const router = express.Router();
 
// Route for user registration
router.post("/createSignup", user.signup);
 
// Route for handling forgot password
router.post("/forgotPassword", user.forgotPassword);
 
// Route for handling change password
router.post("/changePassword", user.changePassword);
 
// Route for handling update profile
router.put("/updateProfile", user.updateProfile);
 
// Route for handling verifyOTP
// router.post("/verifyOTP", user.verifyOTP);
 
// Route for handling loginVerifyOTP
router.post("/loginVerifyOTP", user.loginVerifyOTP);
 
router.post("/resendOtpEmail",user.resendOtpEmail);
 
router.post("/resendOtpMobile",user.resendOtpMobile);
 
router.get("/getAllUser",user.getAllUser);
 

router.get("/getUser/:id",user.getUser);
router.put('/updateUser/:id',user.updateUser);


router.get("/search", user.searchUser);


router.delete("/deleteUser/:id",user.deleteUser);


module.exports = router;
