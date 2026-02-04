import { errorHandler } from "../utils/error.js";
import Listing from "../models/listingModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import dotenv from "dotenv";
import logger from "../monitoring/logger.js";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const gemini = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
// The Gemini text-embedding-004 model is a text embedding model provided by Google through the Gemini API.
//  Its purpose is to generate numerical vector representations (embeddings) of text inputs,
//  capturing their semantic meaning and contextual relationships.

const pricePredictorModelUrl_rent_sale = process.env.ML_MODEL_URI;

async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; // returns array of floats
}
// function cosineSimilarity(vecA, vecB) {
//   const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
//   const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
//   const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
//   return dot / (normA * normB);
// }

export const createListing = async (req, res, next) => {
  try {
    // console.log("inside listing ", req.body);

    let productData = req.body;
    logger.info("Create listing request received", {
      userId: req.user?.id,
      type: req.body?.type,
      city: req.body?.city,
    });

    // Create a description string for embedding
    const embedText = `
      ${productData.name} 
      ${productData.description || ""} 
      ${productData.address || ""} 
      ${productData.city || ""}
      ${productData.type} TYPE, 
      ${productData.bhk} BHK, 
      ₹${productData.discountPrice}, 
      Furnished: ${productData.furnished}, 
      Parking: ${productData.parking}
    `;

    // Generate embedding
    const embedding = await generateEmbedding(embedText);

    const data_sale = {
      Area: productData.area,
      City: productData.city,
      Price: productData.discountPrice,
      Title: productData.name + " " + productData.address,
      bhk: productData.bhk,
    };

    const data_rent = {
      Address: productData.name + " " + productData.address,
      bhk: Number(productData.bhk),
      BathRoom: Number(productData.bathroom),
      Furnished: productData.furnished === true ? 1 : 2,
      city: productData.city,
    };

    // type: sale/rent

    if (productData.type === "sale") {
      // console.log(data_sale);
      const response = await axios.post(
        pricePredictorModelUrl_rent_sale + "/predict-sale",
        data_sale,
      );
      // console.log(response.data.predicted_price);
      productData = {
        predictionPrice: response.data.predicted_price,
        ...req.body,
      };
    } else {
      console.log(data_rent);
      const response = await axios.post(
        pricePredictorModelUrl_rent_sale + "/predict-rent",
        data_rent,
      );
      // console.log(response.data.predicted_price);
      productData = {
        predictionPrice: response.data.predicted_price, // Adjust this key for rent
        ...req.body,
      };
    }
    productData.embedding = embedding;

    const listing = new Listing(productData);
    await listing.save();
    logger.info("Listing created successfully", {
      listingId: listing._id,
      userId: req.user?.id,
      type: listing.type,
    });
    // const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (err) {
    // console.log(err);
    logger.error("Failed to create listing", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      logger.warn("Delete listing failed - not found", {
        listingId: req.params.id,
      });
      return next(errorHandler(404, "Listing Not Found"));
    }

    if (req.user.id !== listing.userRef) {
      logger.warn("Unauthorized delete attempt", {
        listingId: req.params.id,
        userId: req.user.id,
      });
      return next(errorHandler(401, "You can only delete Your own listing "));
    }

    await Listing.findByIdAndDelete(req.params.id);
    logger.info("Listing deleted successfully", {
      listingId: req.params.id,
      userId: req.user.id,
    });
    return res.status(201).json("Listing deleted SuccessFully");
  } catch (err) {
    // console.log(err);
    logger.error("Failed to delete listing", {
      error: err.message,
      stack: err.stack,
      listingId: req.params?.id,
    });
    next(err);
  }
};

export const searchQuery = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      logger.warn("Search query missing");
      return res.status(400).json({ error: "query param is required" });
    }

    logger.info("Search query received", {
      query,
    });

    // 1. Embed user query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Fetch listings

    //  now since we are using the listing_vector_index,
    //  hence mongoDB itself calculates the cosine similarity and returns the topK listings(based on similarity)

    const listings = await Listing.aggregate([
      {
        $vectorSearch: {
          index: "listing_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 10,
        },
      },
      {
        $project: {
          embedding: 0, //  exclude embedding to save bandwidth + memory
          description: 0,
        },
      },
    ]);

    // step 3 and 4 are now being performed by mongoDB atlas vector search

    // 5. Build context string
    const context = listings
      .map(
        (t) => `
      mongo_id: ${t._id}
      Name: ${t.name}
      Address: ${t.address}
      City: ${t.city}
      Type: ${t.type}
      Price: ${t.discountPrice}
      Bedroom: ${t.bhk}
      Bathroom: ${t.bathroom}
      Area: ${t.area}
      Furnished: ${t.furnished}
      Parking: ${t.parking}
    `,
      )
      .join("\n\n");
    // console.log("Context for LLM:", context);
    // 6. Prompt for Gemini
    const prompt = `
You are a helpful AI assistant who answers the user’s real estate queries 
based ONLY on the listings provided in the Context below. 

Each listing has attributes like mongo_id, name, address, type, city, price, 
bedroom, bathroom, area, furnished, parking.

Rules:
1. Only use the listings in Context. Do not invent new listings.  
2. Always return your answer in **this JSON format**:
{
  "text": "<human friendly summary for user>",
  "listings": [
    {
      "mongo_id": "<id>",
      "name": "<property name>",
      "price": "<price>",
      "address": "<address>",
      "bedroom": <int>,
      "bathroom": <int>,
      "furnished": <true/false>,
      "parking": <true/false>
    }
  ]
}

3. In "text", summarize the top 2 to 3 most relevant options in plain English.  
4. In "listings", include the mongo_id and key details for each selected property.  
5. If no matching results, return: {"text": "No matching listings found", "listings": []}  
6. Even when query does not match, you MUST still return at least 1 listing from Context.  
7. Use your judgment to increase the chance of returning something useful.  
8. Always return something in response.

---

User Query: "${query}"

Context:
${context}
`;
    logger.info("Vector search completed", {
      resultCount: listings.length,
    });

    // 7. Call Gemini
    const llmResponse = await gemini.generateContent(prompt);
    console.log("Full LLM response:", llmResponse);
    const rawText = llmResponse.response.text();
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```json\n?/, "").replace(/```$/, "");
    }
    logger.info("LLM response received", {
      responseLength: rawText.length,
    });
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      parsed = { text: "Error parsing response", listings: [] };
      logger.error("Failed to parse LLM response", {
        response: cleanText,
      });
    }

    let enrichedListings = [];
    if (parsed.listings && parsed.listings.length > 0) {
      const ids = parsed.listings.map((l) => l.mongo_id);
      enrichedListings = await Listing.find({ _id: { $in: ids } }).select(
        "-embedding", // exclude embedding field
      );
    }

    return res.status(200).json({
      text: parsed.text,
      listings: enrichedListings,
    });
  } catch (err) {
    logger.error("Search query failed", {
      error: err.message,
      stack: err.stack,
      query: req.query?.query,
    });
    // console.error("Error in /search route:", err.message);
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    logger.info("Update listing request", {
      listingId: req.params.id,
      userId: req.user?.id,
    });
    if (!listing) {
      return next(errorHandler(404, "Listing Not Found"));
    }
    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, "You can only Update Your own listing "));
    }
    const embedText = `
      ${listing.name} 
      ${listing.description || ""} 
      ${listing.address || ""} 
      ${listing.city || ""}
      ${listing.type} TYPE, 
      ${listing.bhk} BHK, 
      ₹${listing.discountPrice}, 
      Furnished: ${listing.furnished}, 
      Parking: ${listing.parking}
    `;

    // Generate embedding
    const embedding = await generateEmbedding(embedText);

    const data_sale = {
      Area: listing.area,
      City: listing.city,
      Price: listing.discountPrice,
      Title: listing.name + " " + listing.address,
      bhk: listing.bhk,
    };

    const data_rent = {
      bhk: listing.bhk,
      Address: listing.name + " " + listing.address,
      city: listing.city,
      BathRoom: listing.bathroom,
      Furnished: listing.furnished === true ? 1 : 2,
    };
    if (listing.type === "sale") {
      // console.log(data_sale);
      const response = await axios.post(
        pricePredictorModelUrl_rent_sale + "/predict-sale",
        data_sale,
      );
      // console.log(response.data.predicted_price);
      listing = {
        predictionPrice: response.data.predicted_price,
        ...req.body,
        embedding,
      };
    } else {
      // console.log(data_rent);
      const response = await axios.post(
        pricePredictorModelUrl_rent_sale + "/predict-rent",
        data_rent,
      );
      console.log(response.data.predicted_price);
      listing = {
        predictionPrice: response.data.predicted_price, // Adjust this key for rent
        ...req.body,
        embedding,
      };
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        predictionPrice: listing.predictionPrice,
      },
      { new: true },
    );
    logger.info("Listing updated successfully", {
      listingId: updatedListing._id,
      userId: req.user.id,
    });
    return res.status(200).json(updatedListing);
  } catch (err) {
    // console.log(err);
    logger.error("Failed to update listing", {
      error: err.message,
      stack: err.stack,
      listingId: req.params?.id,
    });
    next(err);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    logger.info("Fetched listing by ID", { listingId: req.params.id });
    if (!listing) {
      return res
        .status(404)
        .json({ error: "No listing found for the given ID" });
    }
    logger.info("Fetched listing by ID", {
      listingId: req.params.id,
    });
    return res.status(200).json(listing);
  } catch (err) {
    // console.error(err);
    logger.error("Failed to fetch listings", {
      error: err.message,
      stack: err.stack,
      listingId: req.params?.id,
    });
    next(err);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    } else offer = true;

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }
    let parking = req.query.parking;
    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }
    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }
    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const listings = await Listing.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
      ],
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (err) {
    logger.error("Failed to fetch listings", {
      error: err.message,
      stack: err.stack,
      query: req.query,
    });
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
