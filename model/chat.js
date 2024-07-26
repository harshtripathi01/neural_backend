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
  