import { errorHandler } from "../utils/error.js";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import Listing from "../models/listingModel.js";
import logger from "../monitoring/logger.js";

export const updateUser = async (req, res, next) => {
  try {
    // Check if the logged-in user is updating their own account
    if (req.user.id !== req.params.id) {
      logger.warn("Unauthorized user update attempt", {
        userId: req.user.id,
        targetUserId: req.params.id,
        route: "/user/update",
      });
      return next(errorHandler(401, "You Can Only Update Your Own Account"));
    }
    // console.log("in")
    // Prepare updateFields dynamically
    const updateFields = {};

    // Hash password if provided
    if (req.body.password) {
      updateFields.password = await bcrypt.hash(req.body.password, 10);
    }
    // console.log("in1")

    // Add other fields if they exist in req.body
    if (req.body?.username) updateFields.username = req.body.username;
    // console.log("in2")
    if (req.body?.email) updateFields.email = req.body.email;
    // console.log("i3")
    if (req.body?.avatar) updateFields.avatar = req.body.avatar;

    // console.log("in4")
    // Only update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // console.log("in5")
    // console.log("User ID:", req.user?.id);
    // console.log("Update Fields:", updateFields);
    // Perform a single update operation
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true },
    );
    // console.log("in6")
    if (!updatedUser) {
      logger.warn("User not found during update", {
        userId: req.user.id,
      });
      return next(errorHandler(404, "User not found"));
      return next(errorHandler(404, "User not found"));
    }

    // Exclude password before sending response
    const { password, ...rest } = updatedUser._doc;

    // console.log("User updated successfully");
    logger.info("User updated successfully", {
      userId: req.user.id,
      updatedFields: Object.keys(updateFields),
    });
    res.status(200).json(rest);
  } catch (err) {
    logger.error("Update user failed", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    console.log(req.user.id);
    console.log(req.params.id);
    if (req.user.id !== req.params.id) {
      logger.warn("Unauthorized delete attempt", {
        userId: req.user.id,
        targetUserId: req.params.id,
      });
      return next(errorHandler(401, `You Can Delete Your own account `));
    }
    logger.info("User deleted successfully", {
      userId: req.user.id,
    });
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User Has been Deleted ");
  } catch (err) {
    logger.error("Delete user failed", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    next(err);
  }
};

export const getUserListing = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      logger.warn("Unauthorized listing access attempt", {
        userId: req.user.id,
        targetUserId: req.params.id,
      });
      const listings = await Listing.find({ userRef: req.params.id });
      logger.info("User listings fetched", {
        userId: req.user.id,
        count: listings.length,
      });

      res.status(200).json(listings);
    } else {
      //   console.log("Error in viewing Listings");
      logger.error("Fetching user listings failed", {
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
      });
      return next(errorHandler(401, "You can view your own Listings"));
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn("User not found", {
        targetUserId: req.params.id,
      });
      return next(errorHandler(404, "User Not Found!"));
    }
    logger.info("User profile fetched", {
      userId: req.params.id,
    });
    const { password: pass, ...rest } = user._doc;
    return res.status(200).json(rest);
  } catch (err) {
    logger.error("Get user failed", {
      error: err.message,
      stack: err.stack,
      targetUserId: req.params.id,
    });
    // console.log(err);
    next(err);
  }
};
