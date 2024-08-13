const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    question: { type: String },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    image: { type: String },
    answerType: { type: String, enum: ['multiple-choice', 'text'], default: 'text' }, // New field to determine the type of answer
    options: [{ type: String }], // If multiple-choice, these are the options
    answer: [
      {
        solution: { type: String },
        file: { type: String },
        expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        selectedOption: { type: String }, // To store selected option if it's a multiple-choice question
      }
    ]
  },
  { timestamps: true }
);

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
