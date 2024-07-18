const signup = require("../config/mailer_template/signup.js");
const login = require("../config/mailer_template/login.js");
const resend = require("../config/mailer_template/resendotp.js");
const forget = require("../config/mailer_template/resetPassword.js")
const logger = require("../logger");
const verifyotp = require("../config/mailer_template/verifyotp.js");

function signUpBody(newUser) {
  const mail_body = signup.SIGNUP_TEMPLATE.replace(
    "[fullname]",
    newUser.firstName + " " + newUser.lastName
  )
    .replace("[contact]", newUser.contact)
    .replace("[email]", newUser.email)
    .replace("[otp]", newUser.otp);
  return mail_body;
}
function signUpSubject() {
  return signup.SUBJECT;
}

function loginBody(user) {
  const mail_body = login.LOGIN_TEMPLATE.replace(
    "[fullname]",
    user.firstName + " " + user.lastName
  )
    .replace("[contact]", user.contact)
    .replace("[email]", user.email)
    .replace("[otp]", user.otp);
  return mail_body;
}
function loginSubject() {
  return login.LOGIN_SUBJECT;
}
function resendOtpBody(user) {
  const mail_body = resend.ACTIVATION_TEMPLATE.replace(
    "[fullname]",
    user.firstName + " " + user.lastName
  )
    .replace("[contact]", user.contact)
    .replace("[email]", user.email)
    .replace("[otp]", user.otp);
  return mail_body;
}
function resendOtpSubject() {
  return resend.SUBJECT_ACTIVATION;
}
function memberInviteSubject() {
  return member_invite.SUBJECT;
}
function memberInviteBody(agency, team_member, encryptedMember, iv) {
  const mail_body = member_invite.BODY.replace(
    "[fullname]",
    team_member.resourceName
  )
    .replace("[email]", team_member.emailId)
    .replace("[otp]", team_member.otp)
    .replace("[companyName]", agency.companyInfo.companyName)
    .replace("[team-member]", encryptedMember)
    .replace("[iv]", iv);
  return mail_body;
}
function forgetPassword(user) {
  const mail_body = forget.RESET_PASSWORD_TEMPLATE.replace(
    "[fullname]",
    user.firstName + " " + user.lastName
  )
    .replace("[contact]", user.contact)
    .replace("[email]", user.email)
    .replace("[otp]", user.otp);
  return mail_body;
}
function forgetSubject() {
  return forget.SUBJECT;
}

function changePasswordEmail(user) {
  const mail_body = change.CHANGE_PASSWORD_TEMPLATE.replace(
    "[fullname]",
    user.firstName + " " + user.lastName
  )
    .replace("[contact]", user.contact)
    .replace("[email]", user.email);
  return mail_body;
}

function changePasswordSubject() {
  return change.SUBJECT;
}

function loginVerifyOtpBody(user) {
  const mail_body = verifyotp.ACTIVATION_TEMPLATE.replace(
    "[fullname]",
    user.firstName + " " + user.lastName
  )
    .replace("[contact]", user.contact)
    .replace("[email]", user.email)
    .replace("[otp]", user.otp);
  return mail_body;
}
function loginVerifyOtpSubject() {
  return verifyotp.SUBJECT;
}

//CLIENT TEMPLATE STARTS HERE

function clientLoginVerifyOtpBody(client) {
  const mail_body = clientLoginVerifyOTP.ACTIVATION_CLIENT_TEMPLATE
    .replace("[fullname]", client.firstName + " " + client.lastName )
    .replace("[contact]", client.contact)
    .replace("[email]", client.email)
    .replace("[otp]", client.otp);
  return mail_body;
}
function clientLoginVerifyOtpSubject() {
  return clientLoginVerifyOTP.SUBJECT;
}


function clientSignUpBody(newClient) {
 
  const mail_body = clientSignup.SIGNUP_CLIENT_TEMPLATE
 
    .replace("[fullname]", newClient.firstName + " " + newClient.lastName)
    .replace("[contact]", newClient.contact)
    .replace("[email]", newClient.email)
    .replace("[otp]", newClient.otp);
  return mail_body;
  
}
function clientSignUpSubject() {
  return clientSignup.SUBJECT;
}


function clientLoginBody(client) {
  const mail_body = clientLogin.LOGIN_CLIENT_TEMPLATE
    .replace("[fullname]",client.firstName + " " + client.lastName)
    .replace("[contact]", client.contact)
    .replace("[email]", client.email)
    .replace("[otp]", client.otp);
  return mail_body;
}
function clientLoginSubject() {
  return clientLogin.LOGIN_SUBJECT;
}


function clientResendOtpBody(client) {
  const mail_body = clientResendOtp.RESEND_OTP_TEMPLATE
    .replace("[fullname]", client.firstName + " " + client.lastName )
    .replace("[contact]", client.contact)
    .replace("[email]", client.email)
    .replace("[otp]", client.otp);
  return mail_body;
}
function clientResendOtpSubject() {
  return clientResendOtp.RESEND_OTP_SUBJECT;
}

module.exports = {
  signUpBody,
  signUpSubject,
  loginBody,
  loginSubject,
  resendOtpBody,
  resendOtpSubject,
  memberInviteBody,
  memberInviteSubject,
  forgetPassword,
  forgetSubject,
  changePasswordEmail,
  changePasswordSubject,
  loginVerifyOtpSubject,
  loginVerifyOtpBody,

  clientLoginVerifyOtpBody,
  clientLoginVerifyOtpSubject,
  clientSignUpBody,
  clientSignUpSubject,
  clientLoginBody,
  clientLoginSubject,
  clientResendOtpBody,
  clientResendOtpSubject

};
