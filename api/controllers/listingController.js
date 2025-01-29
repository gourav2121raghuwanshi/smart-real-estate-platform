const errorHandler = require('../utils/error.js')
const Listing = require('../models/listingModel.js')
const axios = require('axios');
const pricePredictorModelUrl_rent = 'https://predict-rent.onrender.com/predict-rent';
const pricePredictorModelUrl_sale = 'https://predict-sale.onrender.com/predict-sale';
/*sale
#  {
{
 "area": 1500,
"bedRoom": 3,
"bathroom": 2,
"address": "Karol bagh",
 "furnishDetails": 1,
 "city":"Delhi"
}
# }
rent
"Address": "4BHK , Super Luxury Villa ,Juhu , Mumbai",
"bhk": 4,
"BathRoom": 3,
"Furnished": 1,
"city": "Mumbai"

*/
exports.createListing = async (req, res, next) => {
    try {
        // console.log("inside listing ", req.body);

        let productData = req.body;

        const data_sale = {
            Area: productData.area,
            City: productData.city,
            Price:productData.discountPrice,
            Title:productData.name+" "+productData.address,
            bhk:productData.bhk,
        };

        const data_rent = {
            
            Address:productData.name+" "+productData.address,
            bhk: Number(productData.bhk),
            BathRoom: Number(productData.bathroom),
            Furnished: productData.furnished===true?1:2,
            city: productData.city,
        };

        // type: sale/rent

        if (productData.type === "sale") {
            // console.log(data_sale);
            const response = await axios.post(pricePredictorModelUrl_sale, data_sale);
            // console.log(response.data.predicted_price);
            productData = {
                predictionPrice: response.data.predicted_price,
                ...req.body,
            };
        } else {
            console.log(data_rent);
            const response = await axios.post(pricePredictorModelUrl_rent,data_rent);
            // console.log(response.data.predicted_price);
            productData = {
                predictionPrice: response.data.predicted_price, // Adjust this key for rent
                ...req.body,
            };
        }

        const listing = new Listing(productData);
        await listing.save();
        // const listing = await Listing.create(req.body);
        return res.status(201).json(listing);
    } catch (err) {
        console.log(err)
        next(err);
    }
}

exports.deleteListing = async (req, res, next) => {
    try {

        const listing = await Listing.findById(req.params.id);

    
        if (!listing) {
            return next(errorHandler(404, "Listing Not Found"));
        }
        
        if (req.user.id !== listing.userRef) {
            return next(errorHandler(401, "You can only delete Your own listing "));
        }

        await Listing.findByIdAndDelete(req.params.id);
        return res.status(201).json("Listing deleted SuccessFully");
    } catch (err) {
        console.log(err)
        next(err);
    }
}

exports.updateListing = async (req, res, next) => {
    try {
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            return next(errorHandler(404, "Listing Not Found"));
        }
        if (req.user.id !== listing.userRef) {
            return next(errorHandler(401, "You can only Update Your own listing "));
        }
        const data_sale = {
            Area: listing.area,
            City: listing.city,
            Price:listing.discountPrice,
            Title:listing.name+" "+listing.address,
            bhk:listing.bhk,
        };

        const data_rent = {
            bhk: listing.bhk,
            Address:listing.name+" "+listing.address,
            city: listing.city,
            BathRoom: listing.bathroom,
            Furnished: listing.furnished===true?1:2,
        };
        if (listing.type === "sale") {
            // console.log(data_sale);
            const response = await axios.post(pricePredictorModelUrl_sale, data_sale);
            console.log(response.data.predicted_price);
            listing = {
                predictionPrice: response.data.predicted_price,
                ...req.body,
            };
        } else {
            // console.log(data_rent);
            const response = await axios.post(pricePredictorModelUrl_rent,data_rent);
            console.log(response.data.predicted_price);
            listing = {
                predictionPrice: response.data.predicted_price, // Adjust this key for rent
                ...req.body,
            };
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json(updatedListing);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ error: "No listing found for the given ID" });
        }

        return res.status(200).json(listing);

    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.getListings = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;
        let offer = req.query.offer;
        if (offer === undefined || offer === 'false') {
            offer = { $in: [false, true] };
        }
        else offer = true;

        let furnished = req.query.furnished;
        if (furnished === undefined || furnished === 'false') {
            furnished = { $in: [false, true] };
        }
        let parking = req.query.parking;
        if (parking === undefined || parking === 'false') {
            parking = { $in: [false, true] };
        }
        let type = req.query.type;
        if (type === undefined || type === 'all') {
            type = { $in: ['sale', 'rent'] };
        }
        const searchTerm = req.query.searchTerm || '';
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'desc';

        const listings = await Listing.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { city: { $regex: searchTerm, $options: 'i' } }
            ],
            offer,
            furnished,
            parking,
            type,
        }).sort(
            { [sort]: order }
        ).limit(limit).skip(startIndex);

        return res.status(200).json(listings);

    } catch (err) {
        console.error(err);
        next(err);
    }
};


// name: {
//     $regex: searchTerm, $options: 'i'
// },

// replaced by :
//  $or: [
//     { name: { $regex: searchTerm, $options: 'i' } },
//     { city: { $regex: searchTerm, $options: 'i' } }
// ],