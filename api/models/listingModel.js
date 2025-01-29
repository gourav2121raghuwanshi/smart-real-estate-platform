const { truncate } = require('fs/promises');
const mongoose = require('mongoose')

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
            required: true
        },
        type: {
            type: String,
            required: true
        },
        offer: {
            type: Boolean,
            required: true
        },
        imageUrls: {
            type: Array,
            required: true
        },
        userRef: {
            type: String,
            required: true,
            unique:false
        },
        bhk:{
            type: Number,
            required: true,
        },
        area:{
            type: Number,
            required: true,
        },
        city:{
            type:String,
            required: true
        },
        predictionPrice:{
            type: Number,
            required: false,
            default: null
        }
    }
    , { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
