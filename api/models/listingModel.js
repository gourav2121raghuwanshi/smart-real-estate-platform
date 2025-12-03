import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathroom: {
      type: Number,
      required: true,
    },
    bedroom: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
      unique: false,
    },
    bhk: {
      type: Number,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    predictionPrice: {
      type: Number,
      default: null,
    },
  embedding: {
    type: [Number],  // array of floats
    index: 'vector'  // for MongoDB Atlas Vector Search
  },
  },
  { timestamps: true }
);

listingSchema.index({ name: 'text', address:'text', city:'text' });
listingSchema.index({ type:1, parking:1, furnished:1, regularPrice:1 });
listingSchema.index({ city:1,type: 1, regularPrice:1 }); 
const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
