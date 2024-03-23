const RatingAndReview = require('../models/RatingAndReview.js');
// const User = require("../models/userModel.js");
// const mongoose = require('mongoose')

exports.ratingAndReview = async (req, res) => {
    try {
        const { rating, review, user } = req.body;

        const newReviewAndRating = await RatingAndReview.create({
            rating: rating,
            review: review,
            user: user
        });

        res.status(201).json({
            newReviewAndRating
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

exports.getCurrentratingAndReview = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const newReviewAndRating = await RatingAndReview.find({ user: id });
        console.log(newReviewAndRating);

        if (!newReviewAndRating) {
            return res.status(500).json("Please first make a reivew to see it.")
        }

        return res.status(201).json({
            newReviewAndRating
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};


exports.UpdateratingAndReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        console.log(rating, " ", review);

        const existingReview = await RatingAndReview.findOne({ user: id });
        if (existingReview) {
            await RatingAndReview.findByIdAndDelete(existingReview._id);
        }



        const newReviewAndRating = await RatingAndReview.create({
            rating: rating,
            review: review,
            user: id
        });
        console.log(newReviewAndRating);

        return res.status(200).json({
            success: true,
            newReviewAndRating
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};



exports.getAllRatingAndReviews = async (req, res) => {
    try {
        const ratAndRev = await RatingAndReview.find({}).sort({ rating: "desc" })
            .populate("user");

        // console.log(ratAndRev);
        res.status(200).json({
            success: true,
            message: "Fetched all rating and Review Successfully",
            AllRatingAndReviews: ratAndRev,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}