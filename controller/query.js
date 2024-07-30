// controllers/queryController.js

const Query = require('../model/Query');
const User = require('../model/User');

// Create a new query
exports.createQuery = async (req, res) => {
  const { question, answers, clientId } = req.body;
  try {
    const newQuery = await Query.create({ question, answers, clientId });
    res.status(201).json(newQuery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all queries
exports.getQueries = async (req, res) => {
  try {
    const queries = await Query.findAll({ include: 'client' });
    res.status(200).json(queries);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single query by ID
exports.getQueryById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = await Query.findByPk(id, { include: 'client' });
    if (query) {
      res.status(200).json(query);
    } else {
      res.status(404).json({ error: 'Query not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a query
exports.updateQuery = async (req, res) => {
  const { id } = req.params;
  const { question, answers, clientId } = req.body;
  try {
    const query = await Query.findByPk(id);
    if (query) {
      query.question = question;
      query.answers = answers;
      query.clientId = clientId;
      await query.save();
      res.status(200).json(query);
    } else {
      res.status(404).json({ error: 'Query not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a query
exports.deleteQuery = async (req, res) => {
  const { id } = req.params;
  try {
    const query = await Query.findByPk(id);
    if (query) {
      await query.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Query not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
