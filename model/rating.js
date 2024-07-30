// models/Rating.js

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');
const User = require('./user.js');

class Rating extends Model {}

Rating.init({
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientId: {
    type: DataTypes.STRING,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  },
  expertId: {
    type: DataTypes.STRING,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Rating',
  tableName: 'ratings',
  timestamps: true // Add timestamps (createdAt and updatedAt)
});

Rating.belongsTo(User, { as: 'client', foreignKey: 'clientId' });
Rating.belongsTo(User, { as: 'expert', foreignKey: 'expertId' });

module.exports = Rating;
