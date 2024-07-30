// models/Query.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');
const User = require('./user.js');

class Query extends Model {}

Query.init({
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSONB, // Using JSONB to store array of answers with solution and expertId
    allowNull: true,
    defaultValue: []
  },
  clientId: {
    type: DataTypes.STRING,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Query',
  tableName: 'queries',
  timestamps: true // Add timestamps (createdAt and updatedAt)
});

Query.belongsTo(User, { as: 'client', foreignKey: 'clientId' });

module.exports = Query;
