const User = require('../models/userModel.js')
const bcrypt = require('bcrypt');
require('dotenv').config();
const { errorHandler } = require('../utils/error.js');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    console.log("in");
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ username, email, password: hashedPassword });

        const payload = {
            email: email,
            id: user._id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2d",
        });
        console.log(token);
        const userWithToken = { ...user.toObject(), token };

        const { password: pass, ...rest } = userWithToken;

        const options = {
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.cookie("access_token", token, options).status(200).json({...rest, token});
        // res.status(201).json("User Created Successfully ");
    } catch (err) {
        console.log(`error in signup ${err.message}`);
        next(err);
    }
};

exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const validUser = await User.findOne({ email });

        if (!validUser) {
            return next(errorHandler(404, "User Not Found!"));
        }

        const hashedPassword = validUser.password;
        const validPassword = await bcrypt.compare(password, hashedPassword);
        if (!validPassword) {
            return next(errorHandler(401, "Wrong Credentials"));
        }

        const payload = {
            email: validUser.email,
            id: validUser._id

        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2d",
        });
        console.log(token);
        const userWithToken = { ...validUser.toObject(), token };

        const { password: pass, ...rest } = userWithToken;

        const options = {
            expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.cookie("access_token", token, options).status(200).json({...rest, token});
        
    } catch (err) {
        console.error(`Error in signin: ${err.message}`);
        next(err);
    }
};

exports.google = async (req, res, next) => {
    try {
        console.log("inside o Auth")
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            console.log(token)
            const { password: pass, ...rest } = user._doc;
            res.
                cookie('access_token', token, { httpOnly: true })
                .status(200).json({...rest, token});
        } else {
            const generatePassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatePassword, 10);
            const user = await User.create({ username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), email: req.body.email, password: hashedPassword, avatar: req.body.photo });
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;

            res.
                cookie('access_token', token, { httpOnly: true })
                .status(200).json({...rest, token});

        }
    } catch (err) {
        next(err);
    }
}

exports.signout = async (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json('user has been logged out !');
    }
    catch (err) {
        next(err);
    }
}