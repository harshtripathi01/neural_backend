const message =require("../config/sms_template/signup.js");
const loginmessage =require("../config/sms_template/login.js");
const resendotpmessage =require("../config/sms_template/resendotp.js");
const logger = require("../logger");


function getSignupMessage(newUser) {
    const message_body = message.SIGNUP_MESSAGE
    .replace("[Name]",newUser.firstName + " " + newUser.lastName)
    .replace("[OTP]",newUser.otp);

    return message_body;

};
function getLoginMessage(user) {
    const message_body = loginmessage.LOGIN_MESSAGE
    .replace("[Name]",user.firstName + " " + user.lastName)
    .replace("[OTP]",user.otp);

    return message_body;

};
function getResendOtpMessage(user){
    const message_body = resendotpmessage.RESEND_OTP_MESSAGE
    .replace("[Name]",user.firstName + " " + user.lastName)
    .replace("[OTP]",user.otp);

    return message_body;
}
module.exports= {
    getSignupMessage, getLoginMessage, getResendOtpMessage
}