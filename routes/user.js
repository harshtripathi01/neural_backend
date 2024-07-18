const express = require("express");
const router = express.Router();
const { signup, resendOtpEmail, resendOtpMobile, verifyOTP } = require("../controller/user.js");

// Signup route
router.post("/signup", signup);

// Resend OTP via email route
router.post("/resend-otp-email", resendOtpEmail);

// Resend OTP via mobile route
router.post("/resend-otp-mobile", resendOtpMobile);

// Verify OTP route (assuming you have a verifyOTP function)
router.post("/verify-otp", verifyOTP);

module.exports = router;
