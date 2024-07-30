// associations.js

const User = require('./model/user.js');
const Query = require('./model/query.js');
const Rating = require('./model/rating.js');
const Message = require('./model/message.js');
const Chat = require('./model/chat.js');

// User associations for Query
User.hasMany(Query, { foreignKey: 'clientId', as: 'clientQueries' });
User.hasMany(Query, { foreignKey: 'expertId', as: 'expertQueries' });
Query.belongsTo(User, { foreignKey: 'clientId', as: 'queryClient' });
Query.belongsTo(User, { foreignKey: 'expertId', as: 'queryExpert' });

// User associations for Rating
User.hasMany(Rating, { foreignKey: 'clientId', as: 'clientRatings' });
User.hasMany(Rating, { foreignKey: 'expertId', as: 'expertRatings' });
Rating.belongsTo(User, { foreignKey: 'clientId', as: 'ratingClient' });
Rating.belongsTo(User, { foreignKey: 'expertId', as: 'ratingExpert' });

// Chat and Message associations (if needed)
Chat.belongsToMany(User, { through: 'ChatUsers', as: 'users' });
User.belongsToMany(Chat, { through: 'ChatUsers', as: 'chats' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

module.exports = { User, Query, Rating, Message, Chat };
