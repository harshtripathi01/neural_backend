// models/Message.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection.js');

class Message extends Model {}

Message.init({
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // name of the target model
      key: 'id' // key in the target model
    },
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  chatId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Chats', // name of the target model
      key: 'id' // key in the target model
    },
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages', // Name of the table in the database
  timestamps: true // Add timestamps (createdAt and updatedAt)
});

module.exports = Message;
