import express from 'express';
// import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
// import path from 'path';
import userroute from './routes/userRoute.js';
import authRouter from './routes/authRoute.js';
import listingRouter from './routes/listingRouter.js';
import reviewRatingRouter from './routes/reviewRatingRoute.js';
import dbConnect from './utils/databaseConnect.js';
import cors from 'cors';
import dotenv from 'dotenv';
import client from 'prom-client'
import responseTime from 'response-time';
// import { pipeline } from "@xenova/transformers";
// import Listing from './models/listingModel.js';
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const model = genAI.getGenerativeModel({ model: "text-embedding-004"});

// import axios from 'axios';

dotenv.config();

dbConnect();

// __dirname = path.resolve();

// origin: "http://localhost:5175",
// origin: "https://findyourhome.vercel.app",
const app = express();
app.use(express.json())
app.use(cookieParser());
// app.use(cors('*'));
app.use(
	cors({
    origin: process.env.CLIENT_ORIGIN,
		credentials: true,
	})
)


app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
})



app.use('/api/user', userroute);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/rateus', reviewRatingRouter);



app.get('/', (req, res) => {
  res.send('Welcome to Backend');
});
// const extractor = await pipeline(
//   "feature-extraction",
//   "Xenova/all-MiniLM-L6-v2"
// );
// const response = await extractor(
//   ["A robot may not injure a human being or, through inaction, allow a human being to come to harm."],
//   { pooling: "mean", normalize: true }
// );

// console.log(Array.from(response.data));


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get("/metrics", async (req, res) => {
    try {
        res.setHeader("Content-Type", client.register.contentType);
        const metrics = await client.register.metrics();
        res.send(metrics);
    } catch (error) {
        logger.error("Metrics collection failed: " + error.message);
        res.status(500).json({ status: "Error", error: "Metrics collection failed" });
    }
});


const reqResTime = new client.Histogram({
    name: "http_express_req_res_time",
    help: "Time taken by request and response",
    labelNames: ["method", "route", "status_code"],
    buckets: [10, 50, 100, 200, 400, 500, 800, 1000, 2000,3000], // milliseconds
});

// Total request counter
const totalReqCounter = new client.Counter({
    name: "total_requests",
    help: "Total number of requests received",
});

app.use(
    responseTime((req, res, time) => {
        totalReqCounter.inc();
        reqResTime.labels(req.method, req.url, res.statusCode.toString()).observe(time);
    })
);

// const Listing=require("./models/listingModel.js")
// const updateListings = async () => {
//   try {
 

//     const result = await Listing.updateMany(
//       { city: { $exists: false } }, // Match documents that don't have the 'area' field
//       { $set: {city:"Mumbai" } } // Add 'area' and 'bhk' fields with value 0
//     );

//     console.log(`${result.modifiedCount} listings updated successfully.`);
//   } catch (error) {
//     console.error('Error updating listings:', error);
//     mongoose.connection.close();
//   }
// };

// updateListings();


// const Listing = require("./models/listingModel.js");
// const axios = require("axios");

// const pricePredictorModelUrl_rent_sale = 'https://house-price-prediction-model-g4ex.onrender.com';

// const updateListings = async () => {
//   try {
  
//   const listings = await Listing.find({ predictionPrice: { $exists: false } });
//     let c=0;
//     for (let listing of listings) {
//       const data_sale = {
//             Area: listing.area,
//             City: listing.city,
//             Price:listing.discountPrice,
//             Title:listing.name+" "+listing.address,
//             bhk:listing.bhk,
//         };

//         const data_rent = {
//             bhk: listing.bhk,
//             Address:listing.name+" "+listing.address,
//             city: listing.city,
//             BathRoom: listing.bathroom,
//             Furnished: listing.furnished===true?1:2,
//         };

//       let predictedPrice;

//       if (listing.type === 'sale') {
//         const response = await axios.post(pricePredictorModelUrl_rent_sale+"/predict-sale", data_sale);
//         predictedPrice = response.data.predicted_price;
//         console.log(predictedPrice)
//       } else {
//         const response = await axios.post(pricePredictorModelUrl_rent_sale+"/predict-rent", data_rent);
//         predictedPrice = response.data.predicted_price;
//         console.log(predictedPrice)
//       }
//       // Update the listing with the predicted price
//       const result = await Listing.updateOne(
//         { _id: listing._id },
//         { $set: { predictionPrice: predictedPrice } }
//       );
//       ++c;
//     }
//     console.log(`${c} listing(s) updated with prediction price.`);
//   } catch (error) {
//     console.error('Error updating listings:', error);
//   }
// };


// updateListings();


// // const Listing = require("./models/listingModel.js");

// // const updateListings = async () => {
// //   try {
// //     const result = await Listing.updateMany(
// //       { address: /Ju Beach/ },  // Match listings where 'address' contains 'Ju Beach'
// //       [
// //         { 
// //           $set: { 
// //             address: { $replaceOne: { input: "$address", find: "Ju Beach", replacement: "Juhu" } } 
// //           }
// //         }
// //       ]
// //     );

// //     console.log(`${result.modifiedCount} listings updated successfully.`);
// //   } catch (error) {
// //     console.error('Error updating listings:', error);
// //     mongoose.connection.close();
// //   }
// // };

// // updateListings();
// const embeddingModel = genAI.getGenerativeModel({
//   model: "text-embedding-004",
// });

// async function generateEmbedding(text) {
//   const result = await embeddingModel.embedContent(text);
//   return result.embedding.values; // returns array of floats
// }
// async function updateListings() {
//   try {
   
//     // Find listings without embedding
//     const listings = await Listing.find({ embedding: { $exists: false } });

//     for (const listing of listings) {
//       try {
//         const embedText = `
//           ${listing.name || ""}
//           ${listing.description || ""}
//           ${listing.address || ""}
//           ${listing.city || ""}
//           ${listing.type} TYPE,
//           ${listing.bhk} BHK,
//           ₹${listing.discountPrice},
//           Furnished: ${listing.furnished},
//           Parking: ${listing.parking}
//         `;

//         const vector = await generateEmbedding(embedText);
//         listing.embedding = vector;

//         await listing.save();
//         console.log(listing)
//         console.log(`✅ Updated listing ${listing._id}`);
//       } catch (err) {
//         console.error(`❌ Failed to update ${listing._id}:`, err.message);
//       }
//     }
//     console.log("Disconnected from MongoDB");
//   } catch (err) {
//     console.error("Error:", err.message);
//   }
// }

// updateListings();