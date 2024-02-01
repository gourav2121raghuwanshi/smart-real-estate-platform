const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = () => {
    console.log("in db file");
    mongoose.connect(process.env.DBURL)
    .then(() => {console.log("DB  is Successfull")})
    .catch( (error) => {
        console.log("Issue in DB Connection");
        console.error(error.message);
        process.exit(1);
    } );
}

module.exports = dbConnect;