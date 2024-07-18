const { config } = require("dotenv");
const app_settings = require("../config/app_settings");
const jwtconfig = require("../config/config")
const logger = require("../logger");
const jwt = require("jsonwebtoken");
const { TOKEN } = require("../config/LOG_MSG");





function generateUserId() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let userId = "";
    for (let i = 0; i < app_settings.USER_ID_LENGTH; i++) {
      userId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return userId;
  };

  function generateClientId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let clientId = "";
    for (let i = 0; i < app_settings.CLIENT_ID_LENGTH; i++) {
      clientId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return clientId;
    
  }

  function generateOTP() {
    const n = app_settings.OTP_LENGTH;
    if (n <= 0 || n > 10) {      
        throw new Error('Invalid OTP length. The length should be between 1 and 10 digits.'); 
      }   
        const min = Math.pow(10, n - 1);   
        const max = Math.pow(10, n) - 1;
    otp = Math.floor(min + Math.random() * (max-min+1));
    return otp;
  };
  function generateToken(userId) {
    const token = jwt.sign({ userId: userId }, jwtconfig.secretKey, {
        expiresIn: app_settings.TOKEN_CUSTOMER_VALIDITY ,
      });
      return token;
  };
  function generateClientToken(clientId) {
    const token = jwt.sign({ clientId: clientId }, jwtconfig.secretKey, {
        expiresIn: app_settings.TOKEN_CUSTOMER_VALIDITY ,
      });
      return token;
  };
  function generateAdminToken(adminId) {
    const token = jwt.sign({ adminId: adminId }, jwtconfig.secretKey, {
        expiresIn: app_settings.TOKEN_ADMIN_VALIDITY ,
      });
      return token;
  };
  function decodeToken(token){
    
    logger.debug(TOKEN.DECODED + ": " + token);
    return jwt.decode(token);

  };

  function generateResetToken(clientId) {
    const resetToken = jwt.sign({ clientId: clientId }, jwtconfig.secretKey, {
      expiresIn: app_settings.TOKEN_RESET_VALIDITY,
    });
    return resetToken;
  }
module.exports = {
    generateUserId,
    generateOTP,
    generateToken,
    decodeToken,
    generateAdminToken,
    generateClientId,
    generateResetToken,
    generateClientToken
}