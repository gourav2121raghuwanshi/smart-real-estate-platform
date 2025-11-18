import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnect = () => {
    console.log("db uri is",process.env.DBURL)
    console.log("in db file");
    mongoose.connect(process.env.DBURL)
    
        .then(() => {
            console.log("DB Connection Successful");
        })
        .catch((error) => {
            console.log("Issue in DB Connection");
            console.error(error.message);
            process.exit(1);
        });
}

export default dbConnect;
