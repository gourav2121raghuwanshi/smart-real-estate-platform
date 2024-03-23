const {ratingAndReview,getAllRatingAndReviews,getCurrentratingAndReview,UpdateratingAndReview}=require("../controllers/RatingAndReviewController.js");
const express = require('express');
const router = express.Router();


router.post("/createReviews",ratingAndReview);
router.get("/getReviews",getAllRatingAndReviews);
router.get("/ReviewOfCurrentUser/:id",getCurrentratingAndReview);
router.post("/updateReview/:id",UpdateratingAndReview);


module.exports = router;