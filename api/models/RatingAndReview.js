import mongoose from 'mongoose';

const ratAndRevSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rating: {
    type: Number,
  },
  review: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const RatingAndReview = mongoose.model("RatingAndReview", ratAndRevSchema);
export default RatingAndReview;
