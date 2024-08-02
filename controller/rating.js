const { request, response } = require("express");
const { ObjectId } = require("mongodb");
const Rating = require("../model/rating.js");
const logger = require("../logger");
const SUCCESS_MESSAGE = require("../config/SUCCESS_MESSAGE.js");
const ERROR_MSG = require("../config/ERROR_MSG.js");
const LOG_MSG = require("../config/LOG_MSG");

const createRating = async (request, response) => {
  try {
    const rating = await Rating(request.body).save();
    if (!rating) {
      return response.json({
        message: ERROR_MSG.RATING.INVALID_RATING,
        success: false,
        statuscode: 404,
      });
    }
    return response.json({
      message: SUCCESS_MESSAGE.RATING.CREATE,
      success: true,
      data: rating,
      statuscode: 200,
    });
  } catch (error) {
    logger.error(LOG_MSG.RATING.CREATE + ": " + error);

    return response.status(500).json({
      message: ERROR_MSG.RATING.CREATE,
      success: false,
      statuscode: 500,
    });
  }
};

const getRating = async (request, response) => {
  try {
    const rating = await Rating.findById(request.params.id).lean();

    if (!rating) {
      return response.json({ message: ERROR_MSG.RATING.INVALID_RATING });
    }

    return response.json({
      message: SUCCESS_MESSAGE.RATING.VIEW,
      data: rating,
    });
  } catch (error) {
    logger.error(LOG_MSG.RATING.VIEW + ": " + error);

    return response.status(500).json({
      message: ERROR_MSG.RATING.VIEW,
      success: false,
      statuscode: 500,
    });
  }
};

const getAllRatings = async (request, response) => {
  try {
    const ratingData = await Rating.find();

    return response.json({
      message: SUCCESS_MESSAGE.RATING.LIST,
      data: ratingData,
    });
  } catch (error) {
    return response.status(500).json({ message: ERROR_MSG.RATING.LIST });
  }
};

const updateRating = async (request, response) => {
  try {
    const rating = await Rating.findById(request.params.id);

    if (!rating) {
      return response.json({
        message: ERROR_MSG.RATING.INVALID_RATING,
        success: false,
        statuscode: 404,
      });
    }

    Object.assign(rating, request.body);

    const updatedRating = await rating.save();

    return response.json({
      message: SUCCESS_MESSAGE.RATING.UPDATE,
      success: true,
      data: updatedRating,
      statuscode: 200,
    });
  } catch (error) {
    logger.error(LOG_MSG.RATING.UPDATE + ": " + error);

    return response.status(500).json({
      message: ERROR_MSG.RATING.UPDATE,
      success: false,
      statuscode: 500,
    });
  }
};

const deleteRating = async (request, response) => {
  try {
    const rating = await Rating.findById(request.params.id).lean();

    if (!rating) {
      return response.json({
        message: ERROR_MSG.RATING.INVALID_RATING,
        success: false,
        statuscode: 404,
      });
    }

    await Rating.deleteOne({ _id: request.params.id });

    return response.json({
      message: SUCCESS_MESSAGE.RATING.DELETE,
      success: true,
      data: rating,
      statuscode: 200,
    });
  } catch (error) {
    logger.error(LOG_MSG.RATING.DELETE + ": " + error);

    return response.status(500).json({
      message: ERROR_MSG.RATING.DELETE,
      success: false,
      statuscode: 500,
    });
  }
};

module.exports = {
  createRating,
  getRating,
  getAllRatings,
  updateRating,
  deleteRating
};
