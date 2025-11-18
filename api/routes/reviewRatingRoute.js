import express from 'express';
import { 
  ratingAndReview, 
  getAllRatingAndReviews, 
  getCurrentratingAndReview, 
  UpdateratingAndReview 
} from "../controllers/RatingAndReviewController.js";

const router = express.Router();


router.post("/createReviews",ratingAndReview);
router.get("/getReviews",getAllRatingAndReviews);
router.get("/ReviewOfCurrentUser/:id",getCurrentratingAndReview);
router.post("/updateReview/:id",UpdateratingAndReview);

export default router;