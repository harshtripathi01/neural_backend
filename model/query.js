const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    question:{type:String},
    clientId:{type:mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    image:{type:String},
    answer:[{
          solution:{type:String},
          file:{type:String},
          expert:{type:mongoose.Schema.Types.ObjectId, ref: 'User'}
    }]

  },
  { timestamps: true }
);

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
