const express = require('express');
const queryController = require('../controller/query.js');

const router = express.Router();

router.post('/postQuestion', queryController.postQuestion);
router.post('/answerQuestion/:queryId', queryController.answerQuestion);
router.get('/getAllQuestions', queryController.getAllQuestions);
router.get('/getQuestion/:id', queryController.getQuestionById);

module.exports = router;
