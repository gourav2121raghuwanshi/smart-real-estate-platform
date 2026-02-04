import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../monitoring/logger.js";
dotenv.config();

const dbConnect = () => {
  // console.log("db uri is",process.env.DBURL)
  // console.log("in db file");
  logger.info("Initializing database connection");

  if (!process.env.DBURL) {
    logger.error("DBURL not found in environment variables");
    process.exit(1);
  }
  mongoose
    .connect(process.env.DBURL)

    .then(() => {
      // console.log("DB Connection Successful");
      logger.info("Database connection established successfully", {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      });
    })
    .catch((error) => {
      //   console.log("Issue in DB Connection");
      //   console.error(error.message);
      logger.error("Database connection failed", {
        error: error.message,
        stack: error.stack,
      });

      process.exit(1);
    });
};

export default dbConnect;
