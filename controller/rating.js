// controllers/ratingController.js

const Rating = require('../model/rating.js');
const User = require('../model/user.js');

// Create a new rating
exports.createRating = async (req, res) => {
  const { rating, review, clientId, expertId } = req.body;
  try {
    const newRating = await Rating.create({ rating, review, clientId, expertId });
    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all ratings
exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({ include: ['client', 'expert'] });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single rating by ID
exports.getRatingById = async (req, res) => {
  const { id } = req.params;
  try {
    const rating = await Rating.findByPk(id, { include: ['client', 'expert'] });
    if (rating) {
      res.status(200).json(rating);
    } else {
      res.status(404).json({ error: 'Rating not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a rating
exports.updateRating = async (req, res) => {
  const { id } = req.params;
  const { rating, review, clientId, expertId } = req.body;
  try {
    const ratingInstance = await Rating.findByPk(id);
    if (ratingInstance) {
      ratingInstance.rating = rating;
      ratingInstance.review = review;
      ratingInstance.clientId = clientId;
      ratingInstance.expertId = expertId;
      await ratingInstance.save();
      res.status(200).json(ratingInstance);
    } else {
      res.status(404).json({ error: 'Rating not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  const { id } = req.params;
  try {
    const rating = await Rating.findByPk(id);
    if (rating) {
      await rating.destroy();
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Rating not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
