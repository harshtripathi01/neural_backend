// models/User.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection.js');

class User extends Model {}

User.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  facebookID: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile_number_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  account_activated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mobile_otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  change_password: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  addressId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otpGeneratedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_type: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users', // Name of the table in the database
  timestamps: true // Add timestamps (createdAt and updatedAt)
});

module.exports = User;
