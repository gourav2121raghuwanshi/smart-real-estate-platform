import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { errorHandler } from "../utils/error.js";
import logger from "../monitoring/logger.js";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

/* ========================= SIGNUP ========================= */

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    logger.info("Signup attempt", {
      route: "/signup",
      method: req.method,
      email,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    const { password: pass, ...rest } = user.toObject();

    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      })
      .status(201)
      .json({ ...rest, token });

    logger.info("User signed up successfully", {
      userId: user._id,
      email,
    });
  } catch (err) {
    logger.error("Signup failed", {
      error: err.message,
      route: "/signup",
    });
    next(err);
  }
};

/* ========================= SIGNIN ========================= */

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info("Signin attempt", {
      route: "/signin",
      email,
    });

    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return next(errorHandler(401, "Wrong Credentials"));
    }

    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    const { password: pass, ...rest } = user.toObject();

    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json({ ...rest, token });

    logger.info("User signed in successfully", {
      userId: user._id,
    });
  } catch (err) {
    logger.error("Signin failed", {
      error: err.message,
      route: "/signin",
    });
    next(err);
  }
};

/* ========================= GOOGLE AUTH ========================= */

export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;

    if (!email) {
      return next(errorHandler(400, "Google account email missing"));
    }

    let user = await User.findOne({ email });

    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      user = await User.create({
        username:
          name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email,
        password: hashedPassword,
        avatar: photo,
      });
    }

    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    const { password: pass, ...rest } = user.toObject();

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json({ ...rest, token });

    logger.info("Google OAuth success", {
      userId: user._id,
      email,
    });
  } catch (err) {
    logger.error("Google OAuth failed", {
      error: err.message,
      route: "/google",
    });
    next(err);
  }
};

/* ========================= SIGNOUT ========================= */

export const signout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    logger.info("User signed out", {
      route: "/signout",
      method: req.method,
    });
    res.status(200).json("User logged out successfully");
  } catch (err) {
    logger.error("Signout failed", {
      error: err.message,
      route: "/signout",
    });
    next(err);
  }
};
