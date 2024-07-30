require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const app = require("./app");


// Sync the models with the database
// Sequelize.sync({ alter: true })
//   .then(() => console.log('Models synced with PostgreSQL'))
//   .catch(err => console.error('Error syncing models:', err));

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
