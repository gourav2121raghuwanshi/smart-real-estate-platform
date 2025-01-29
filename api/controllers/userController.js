const { errorHandler } = require("../utils/error.js");
const bcrypt = require('bcrypt');
const User = require('../models/userModel.js');
const Listing = require('../models/listingModel.js')
exports.updateUser = async (req, res, next) => {
    try {
        // Check if the logged-in user is updating their own account
        if (req.user.id !== req.params.id) {
            return next(errorHandler(401, "You Can Only Update Your Own Account"));
        }
        console.log("in")
        // Prepare updateFields dynamically
        const updateFields = {};

        // Hash password if provided
        if (req.body.password) {
            updateFields.password = await bcrypt.hash(req.body.password, 10);
        }
        console.log("in1")

        // Add other fields if they exist in req.body
        if (req.body?.username) updateFields.username = req.body.username;
        console.log("in2")
        if (req.body?.email) updateFields.email = req.body.email;
        console.log("i3")
        if (req.body?.avatar) updateFields.avatar = req.body.avatar;

        console.log("in4")
        // Only update if there are fields to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        console.log("in5")
        console.log("User ID:", req.user?.id);
        console.log("Update Fields:", updateFields);
        // Perform a single update operation
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true });
        console.log("in6")
        if (!updatedUser) {
            return next(errorHandler(404, "User not found"));
        }

        // Exclude password before sending response
        const { password, ...rest } = updatedUser._doc;

        console.log("User updated successfully");
        res.status(200).json(rest);

    } catch (err) {
        next(err);
    }
};
// exports.updateUser = async (req, res, next) => {
//     try {
//         if (req.user.id !== req.params.id) return next(errorHandler(401, "You Can Only Update Your Own Account"));
//         if (req.body.password) {
//             req.body.password = await bcrypt.hash(req.body.password, 10);
//         }
//         console.log("in update user" + JSON.stringify(req.body, null, 2) + JSON.stringify(req.user, null, 2))
//         let updatedUser = await User.findById(req.user.id);
//         if (req.body?.username) {
//             updatedUser = await User.findByIdAndUpdate(req.user.id, {
//                 $set: {
//                     username: req.body?.username,
//                 }
//             }, { new: true })
//         }
//         if (req.body?.email) {
//             updatedUser = await User.findByIdAndUpdate(req.user.id, {
//                 $set: {
//                     email: req.body?.email,
//                 }
//             }, { new: true })
//         }
//         if (req.body?.password) {
//             updatedUser = await User.findByIdAndUpdate(req.user.id, {
//                 $set: {
//                     password: req.body?.password,
//                 }
//             }, { new: true })
//         }
//         if (req.body?.avatar) {
//             updatedUser = await User.findByIdAndUpdate(req.user.id, {
//                 $set: {
//                     avatar: req.body?.avatar
//                 }
//             }, { new: true })
//         }


//         const { password, ...rest } = updatedUser._doc;

//         console.log("out of  update user")
//         res.status(200).json({ ...rest });

//     } catch (err) {
//         // console.log(err)
//         next(err);
//     }
// };

exports.deleteUser = async (req, res, next) => {
    try {
        console.log(req.user.id)
        console.log(req.params.id)
        if (req.user.id !== req.params.id) {
            return next(errorHandler(401, `You Can Delete Your own account `));
        }
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie('access_token')
        res.status(200)
            .json('User Has been Deleted ')


    } catch (err) {
        next(err);
    }
};

exports.getUserListing = async (req, res, next) => {
    try {
        if (req.user.id === req.params.id) {
            const listings = await Listing.find({ userRef: req.params.id });
            res.status(200).json(listings);
        } else {
            console.log("Error in viewing Listings");
            return next(errorHandler(401, "You can view your own Listings"));
        }
    } catch (err) {
        console.log(err);
        next(err)
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(errorHandler(404, "User Not Found!"))
        }
        const { password: pass, ...rest } = user._doc;
        return res.status(200).json(rest);
    } catch (err) {
        console.log(err);
        next(err)
    }
}