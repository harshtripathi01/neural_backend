const express = require("express");
const rating = require("../controller/rating.js")

const router = express.Router();
router.post("/createRating", rating.createRating);
router.get("/getAllRatings", rating.getAllRatings);
router.get("/getRating/:id", rating.getRating);
router.put("/updateRating/:id", rating.updateRating);
router.delete("/deleteRating/:id", rating.deleteRating);
router.post("/addRatingToProduct/:productId", rating.addRatingToProduct);

module.exports = router