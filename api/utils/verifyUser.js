// import { errorHandler } from './error.js';
// import * as jwt from 'jsonwebtoken';

// export const verifyToken = async (req, res, next) => {
//     // const token = req.cookies.access_token ;
//     const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // "Bearer <token>"
    
//     // console.log("token uri user"+token);
//     if (!token) {
//         console.log("no token given")
//         return next(errorHandler(401, "Unauthorized: Token is empty or incorrect"));
//     }
   

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return next(errorHandler(403, `Forbidden: ${err}`));

//         req.user = user;
//         next();
//     });
// };


import { errorHandler } from "./error.js";
import { createRequire } from "module";
import logger from "../monitoring/logger.js";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    logger.warn("JWT missing in request", {
      route: req.originalUrl,
      method: req.method,
    });
    return next(errorHandler(401, "Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("JWT verification failed", {
        error: err.message,
      });
      return next(errorHandler(403, "Forbidden"));
    }

    req.user = user;
    next();
  });
};
