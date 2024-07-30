// routes/ratingRoutes.js

const express = require('express');
const router = express.Router();
const ratingController = require('../controller/rating.js');

// Create a new rating
router.post('/ratings', ratingController.createRating);

// Get all ratings
router.get('/ratings', ratingController.getRatings);

// Get a single rating by ID
router.get('/ratings/:id', ratingController.getRatingById);

// Update a rating
router.put('/ratings/:id', ratingController.updateRating);

// Delete a rating
router.delete('/ratings/:id', ratingController.deleteRating);

module.exports = router;
