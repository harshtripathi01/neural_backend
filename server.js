const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const Message = require("./model/message.js");
const app = require("./app");
const config = require("./config/config.js");

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

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
      socket.in(user._id).emit("message received", newMessageReceived);
    });

    chat.admin.forEach((admin) => {
      socket.in(admin._id).emit("message received", newMessageReceived);
    });

    try {
      // Create a new message document using your Mongoose model
      const newMessage = new Message({
        sender: newMessageReceived.sender,
        content: newMessageReceived.content,
        chat: newMessageReceived.chat._id,
        // Add other fields as necessary
      });

      // Save the message to the database
      await newMessage.save();
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  socket.on("disconnect", () => {
    console.log('Client disconnected');
  });
});

// Use the same port for both Express and socket.io
const port = process.env.APP_PORT || 8500;
server.listen(port, (err) => {
  if (err) {
    console.log("Error in starting server", err);
    return;
  }
  console.log(`Server is running on port: ${port}`);
});
