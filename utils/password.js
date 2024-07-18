const bcrypt = require('bcrypt');
const app_settings = require('../config/app_settings');
const logger = require("../logger");

async function getEncryptPassword(password) {
  const saltRounds = app_settings.SALT_ROUNDS; // Get the number of salt rounds from your app settings
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

module.exports = { getEncryptPassword };
