const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const path = require('path');
const userroute = require('./routes/userRoute.js')
const authRouter = require('./routes/authRoute.js');
const listingRouter = require('./routes/listingRouter.js');
const reviewRatingRouter=require("./routes/reviewRatingRoute.js")
const dbConnect=require('./utils/databaseConnect.js')
const cors = require('cors');
require('dotenv').config();

dbConnect();

__dirname = path.resolve();

const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(cors());

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
})
app.use('/api/user', userroute);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/rateus', reviewRatingRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

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
