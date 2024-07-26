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
  }, 
    {
        sequelize,
        modelName: 'Message',
        tableName: 'messages', // Name of the table in the database
        timestamps: true // Add timestamps (createdAt and updatedAt)
      });
      

  