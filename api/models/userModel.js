import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/domheydkx/image/upload/v1705905528/gourav/uyb6ntwjcrxacztiw4iv.jpg"
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
