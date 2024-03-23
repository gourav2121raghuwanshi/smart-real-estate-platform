const mongoose = require("mongoose")

const ratAndRevSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    rating:  {
        type: Number,
    },
    review: {
        type: String,
        trim: true,
    },


})
module.exports = mongoose.model("RatingAndReview", ratAndRevSchema)