// models/Chat.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection.js');

class Chat extends Model {}

Chat.init({
  chatName: {
    type: DataTypes.STRING,
    allowNull: true,
    trim: true,
  },
  isGroupChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  latestMessageId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Messages', // name of the target model
      key: 'id' // key in the target model
    }
  }
}, {
  sequelize,
  modelName: 'Chat',
  tableName: 'chats', // Name of the table in the database
  timestamps: true // Add timestamps (createdAt and updatedAt)
});

module.exports = Chat;
