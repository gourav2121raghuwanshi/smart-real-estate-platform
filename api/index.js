const express = require('express')
// const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
// const path = require('path');
const userroute = require('./routes/userRoute.js')
const authRouter = require('./routes/authRoute.js');
const listingRouter = require('./routes/listingRouter.js');
const reviewRatingRouter=require("./routes/reviewRatingRoute.js")
const dbConnect=require('./utils/databaseConnect.js')
const cors = require('cors');
require('dotenv').config();
// const Listing = require("./models/listingModel.js");
// const axios = require("axios");
dbConnect();

// __dirname = path.resolve();


const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(cors());
// app.use(
//   cors({
//       origin: "https://reat-estate-mern.vercel.app",
//       methods: "GET,POST,PUT,DELETE",
//       credentials: true,
//   })
// );


app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
})

app.get('/', (req, res) => {
  res.send('Welcome to Backend');
});




app.use('/api/user', userroute);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/rateus', reviewRatingRouter);




// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// })

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});




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

// const pricePredictorModelUrl_rent = 'https://predict-rent.onrender.com/predict-rent';
// const pricePredictorModelUrl_sale = 'https://predict-sale.onrender.com/predict-sale';

// const updateListings = async () => {
//   try {
  
//   const listings = await Listing.find({ predictionPrice: { $exists: false } });

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
//             Furnished: productData.furnished===true?1:2,
//         };

//       let predictedPrice;

//       if (listing.type === 'sale') {
//         const response = await axios.post(pricePredictorModelUrl_sale, data_sale);
//         predictedPrice = response.data.predicted_price;
//         console.log(predictedPrice)
//       } else {
//         const response = await axios.post(pricePredictorModelUrl_rent, data_rent);
//         predictedPrice = response.data.predicted_price;
//         console.log(predictedPrice)
//       }
//       // Update the listing with the predicted price
//       const result = await Listing.updateOne(
//         { _id: listing._id },
//         { $set: { predictionPrice: predictedPrice } }
//       );

//       console.log(`${result.nModified} listing(s) updated with prediction price.`);
//     }
//   } catch (error) {
//     console.error('Error updating listings:', error);
//   }
// };

// Call the updateListings function to perform the update
// updateListings();


// const Listing = require("./models/listingModel.js");

// const updateListings = async () => {
//   try {
//     const result = await Listing.updateMany(
//       { address: /Ju Beach/ },  // Match listings where 'address' contains 'Ju Beach'
//       [
//         { 
//           $set: { 
//             address: { $replaceOne: { input: "$address", find: "Ju Beach", replacement: "Juhu" } } 
//           }
//         }
//       ]
//     );

//     console.log(`${result.modifiedCount} listings updated successfully.`);
//   } catch (error) {
//     console.error('Error updating listings:', error);
//     mongoose.connection.close();
//   }
// };

// updateListings();