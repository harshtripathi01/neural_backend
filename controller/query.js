const Query = require('../model/query');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const logger = require('../logger');
const SUCCESS_MESSAGE = require('../config/SUCCESS_MESSAGE');
const ERROR_MSG = require('../config/ERROR_MSG');
const LOG_MSG = require('../config/LOG_MSG');

// Function for client to post a question
const postQuestion = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const detoken = jwt.decode(token);
    const clientId = detoken.userId;

    const { question } = req.body;

    const newQuery = new Query({
      question: question,
      clientId: clientId
    });

    const savedQuery = await newQuery.save();

    return res.json({
      message: SUCCESS_MESSAGE.QUERY.POST,
      success: true,
      data: savedQuery,
      statuscode: 200
    });
  } catch (error) {
    logger.error(LOG_MSG.QUERY.POST + ": " + error);
    return res.status(500).json({
      message: ERROR_MSG.QUERY.POST,
      success: false,
      statuscode: 500
    });
  }
};

// Function for expert to answer a question
const answerQuestion = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const detoken = jwt.decode(token);
    const expertId = detoken.userId;

    const { solution, file } = req.body;
    const queryId = req.params.queryId;

    const query = await Query.findById(queryId);

    if (!query) {
      return res.status(404).json({
        message: ERROR_MSG.QUERY.NOT_FOUND,
        success: false,
        statuscode: 404
      });
    }

    const newAnswer = {
      solution: solution,
      file: file,
      expert: expertId
    };

    query.answer.push(newAnswer);
    const updatedQuery = await query.save();

    return res.json({
      message: SUCCESS_MESSAGE.QUERY.ANSWER,
      success: true,
      data: updatedQuery,
      statuscode: 200
    });
  } catch (error) {
    logger.error(LOG_MSG.QUERY.ANSWER + ": " + error);
    return res.status(500).json({
      message: ERROR_MSG.QUERY.ANSWER,
      success: false,
      statuscode: 500
    });
  }
};

// Function to get all questions
const getAllQuestions = async (req, res) => {
  try {
    const queries = await Query.find().populate('clientId', 'username').populate('answer.expert', 'username');

    return res.json({
      message: SUCCESS_MESSAGE.QUERY.LIST,
      success: true,
      data: queries,
      statuscode: 200
    });
  } catch (error) {
    logger.error(LOG_MSG.QUERY.LIST + ": " + error);
    return res.status(500).json({
      message: ERROR_MSG.QUERY.LIST,
      success: false,
      statuscode: 500
    });
  }
};

// Function to get a single question by ID
const getQuestionById = async (req, res) => {
  try {
    const queryId = req.params.id;
    const query = await Query.findById(queryId).populate('clientId', 'username').populate('answer.expert', 'username');

    if (!query) {
      return res.status(404).json({
        message: ERROR_MSG.QUERY.NOT_FOUND,
        success: false,
        statuscode: 404
      });
    }

    return res.json({
      message: SUCCESS_MESSAGE.QUERY.VIEW,
      success: true,
      data: query,
      statuscode: 200
    });
  } catch (error) {
    logger.error(LOG_MSG.QUERY.VIEW + ": " + error);
    return res.status(500).json({
      message: ERROR_MSG.QUERY.VIEW,
      success: false,
      statuscode: 500
    });
  }
};

module.exports = {
  postQuestion,
  answerQuestion,
  getAllQuestions,
  getQuestionById
};
