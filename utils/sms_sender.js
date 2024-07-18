const twilio = require('twilio');
const app_settings = require("../config/app_settings");
const constant = require('../config/constant');
const logger = require("../logger");


const sendOTP = (mobileNumber,sms_body) => {

  try{

    switch(app_settings.SMS_PLATFORM){
      case constant.TWILIO:{
        return sendOtpViaTwilio(mobileNumber,sms_body);
      }
      case constant.MSG91:{
        return sendOtpViaMsg91(mobileNumber,sms_body);
      }
      default:{
        return 
      }
    }
  }
    catch{((error) => console.error(error))};
};

const sendOtpViaTwilio = (mobileNumber,sms_body) => {
  const accountSid = app_settings.TWILIO_ACCOUNT_SID;
  const authToken = app_settings.TWILIO_AUTH_TOKEN;
  const client = new twilio(accountSid, authToken);

  // Send SMS with OTP
  client.messages
    .create({
      body: sms_body,
      from: app_settings.TWILIO_MOBILE_NO,
      to: mobileNumber,
    })
    .then((message) => console.log(`OTP sent with SID: ${message.sid}`))
    .catch((error) => console.error(error));
};

const sendOtpViaMsg91 = (mobileNumber,sms_body) => {
  // Send SMS with OTP
  client.messages
    .create({   
      body: sms_body,
      from: app_settings.TWILIO_MOBILE_NO,
      to: mobileNumber,
    })
    .then((message) => console.log(`OTP sent with SID: ${message.sid}`))
    .catch((error) => console.error(error));
};


// Usage
const mobileNumber = '+1234567890'; // Replace with the recipient's mobile number
const otp = '1234'; // Generate your OTP

sendOTP(mobileNumber, otp);
