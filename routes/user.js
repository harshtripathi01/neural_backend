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
 
router.post("/login",user.login);

router.put('/updateUser/:identifier',user.updateUser);

router.get('/getUserById/:identifier',user.getUserById);

router.get("/search", user.searchUser);

router.post("/sendInvite",user.sendInvite);

router.delete("/deleteUser/:id",user.deleteUser);

router.get("/getAgencyResource",user.getAgencyResource);


router.patch("/updateStatus/:email/:status",user.updateStatus);

router.get("/getUserStatus",user.getUserStatus);

// router.get("/getProfileByUserName/:username", user.getProfileByUserName);

router.get("/getProfileByUserName/:urlSlug", user.getProfileByUserName);

router.delete("/deleteResource/:parentCompany/:email", user.deleteResource);

router.get("/downloadUserCSV", user.downloadUserCSV);

router.get("/downloadUserAgencyCSV", user.downloadUserAgencyCSV);

router.get("/downloadUserIndividualCSV", user.downloadUserIndividualCSV);

router.post("/uploadUserCSV", user.uploadUserCSV);
 
module.exports = router;
