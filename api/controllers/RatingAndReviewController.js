import RatingAndReview from "../models/RatingAndReview.js";
// import User from '../models/userModel.js';
// import mongoose from 'mongoose';

export const ratingAndReview = async (req, res) => {
  try {
    const { rating, review, user } = req.body;

    const newReviewAndRating = await RatingAndReview.create({
      rating: rating,
      review: review,
      user: user,
    });
    logger.info("Rating and review created", {
      userId: user,
      rating,
    });
    res.status(201).json({
      newReviewAndRating,
    });
  } catch (err) {
    logger.error("Failed to create rating and review", {
      error: err.message,
      stack: err.stack,
      userId: req.body?.user,
    });
    // console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getCurrentratingAndReview = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const newReviewAndRating = await RatingAndReview.find({ user: id });
    // console.log(newReviewAndRating);

    if (!newReviewAndRating) {
      logger.warn("No rating/review found for user", {
        userId: id,
      });
      return res.status(500).json("Please first make a reivew to see it.");
    }
    logger.info("Fetched user rating and review", {
      userId: id,
      count: reviews.length,
    });
    return res.status(201).json({
      newReviewAndRating,
    });
  } catch (err) {
    // console.error(err);
    logger.error("Failed to fetch current rating and review", {
      error: err.message,
      stack: err.stack,
      userId: req.params?.id,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const UpdateratingAndReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    console.log(rating, " ", review);

    const existingReview = await RatingAndReview.findOne({ user: id });
    if (existingReview) {
      logger.info("Existing rating deleted before update", {
        userId: id,
        oldReviewId: existingReview._id,
      });
      await RatingAndReview.findByIdAndDelete(existingReview._id);
    }

    const newReviewAndRating = await RatingAndReview.create({
      rating: rating,
      review: review,
      user: id,
    });
    // console.log(newReviewAndRating);
    logger.info("Rating and review updated", {
      userId: id,
      rating,
    });
    return res.status(200).json({
      success: true,
      newReviewAndRating,
    });
  } catch (err) {
    // console.error(err);
    logger.error("Failed to update rating and review", {
      error: err.message,
      stack: err.stack,
      userId: req.params?.id,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getAllRatingAndReviews = async (req, res) => {
  try {
    const ratAndRev = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate("user");

    // console.log(ratAndRev);
    logger.info("Fetched all ratings and reviews", {
      total: ratAndRev.length,
    });

    res.status(200).json({
      success: true,
      message: "Fetched all rating and Review Successfully",
      AllRatingAndReviews: ratAndRev,
    });
  } catch (err) {
    // console.error(err);
    logger.error("Failed to fetch all ratings and reviews", {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
