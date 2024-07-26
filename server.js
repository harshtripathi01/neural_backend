require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const app = require("./app");

// Initialize Sequelize for PostgreSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres'
});

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL:', err));

// Define User model
const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: true
});

// Define Chat model
const Chat = sequelize.define('Chat', {
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
      model: 'Messages',
      key: 'id'
    }
  }
}, {
  timestamps: true,
});

// Define Message model
const Message = sequelize.define('Message', {
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
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
      model: 'Chats',
      key: 'id'
    },
    allowNull: false
  }
}, {
  timestamps: true
});

// Define relationships
User.belongsToMany(Chat, { through: 'ChatUsers' });
Chat.belongsToMany(User, { through: 'ChatUsers' });
Chat.hasMany(Message, { foreignKey: 'chatId' });
Message.belongsTo(User, { foreignKey: 'senderId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });

// Sync the models with the database
sequelize.sync()
  .then(() => console.log('Models synced with PostgreSQL'))
  .catch(err => console.error('Error syncing models:', err));

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize socket.io
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log('New client connected');

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", async (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      socket.in(user.id).emit("message received", newMessageReceived);
    });

    try {
      // Create a new message document using Sequelize
      const newMessage = await Message.create({
        senderId: newMessageReceived.sender.id,
        content: newMessageReceived.content,
        chatId: newMessageReceived.chat.id
      });

      console.log('Message saved to database:', newMessage);
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  socket.on("disconnect", () => {
    console.log('Client disconnected');
  });
});

// Use the same port for both Express and socket.io
const port = process.env.APP_PORT || 9001;
server.listen(port, (err) => {
  if (err) {
    console.log("Error in starting server", err);
    return;
  }
  console.log(`Server is running on port: ${port}`);
});
