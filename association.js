// associations.js

const User = require('./models/User');
const Message = require('./models/Message');
const Chat = require('./models/Chat');

User.belongsToMany(Chat, { through: 'ChatUsers' });
User.hasMany(Message, { foreignKey: 'senderId' });

Chat.hasMany(Message, { foreignKey: 'chatId' });
Chat.belongsToMany(User, { through: 'ChatUsers' });

Message.belongsTo(User, { foreignKey: 'senderId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });

module.exports = { User, Message, Chat };
