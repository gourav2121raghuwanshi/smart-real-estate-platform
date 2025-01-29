from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd
import re

app = Flask(__name__)

# Load the saved models and encoders
with open('best_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

with open('tfidf_vectorizer.pkl', 'rb') as f:
    tfidf_vectorizer = pickle.load(f)

with open('city_encoder.pkl', 'rb') as f:
    city_encoder = pickle.load(f)

with open('label_encoder.pkl', 'rb') as f:
    furnished_encoder = pickle.load(f)

with open('RandomForestRegressor_best_model.pkl', 'rb') as f:
    best_model = pickle.load(f)

with open('sale_label_encoder_city.pkl', 'rb') as f:
    label_encoder_city = pickle.load(f)

with open('sale_label_encoder_property_type.pkl', 'rb') as f:
    label_encoder_property_type = pickle.load(f)

with open('sale_tfidf_vectorizer.pkl', 'rb') as f:
    tfidf_vectorizer_sale = pickle.load(f)


@app.route('/', methods=['GET'])
def hello():
    return "welcome"


@app.route('/predict-rent', methods=['POST'])
def predict_rent():
    try:
        # Parse the input JSON
        data = request.json

        # Extract inputs
        title_address = data.get('Address')
        bhk = int(data.get('bhk', 0))
        bathroom = int(data.get('BathRoom', 0))
        furnished = data.get('Furnished')
        city = data.get('city')

        # Validate inputs
        if not title_address or not furnished or not city:
            return jsonify({'error': 'Missing required fields: Address, Furnished, or city'}), 400

        # Encode inputs
        bhk_weighted = bhk * 3
        furnished_numerical = furnished
        # furnished_encoder.transform([furnished])[0]

        # Transform address using TF-IDF
        address_tfidf = tfidf_vectorizer.transform([title_address]).toarray()

        # Encode city and apply weight
        city_encoded = city_encoder.transform([[city]])
        city_encoded_weighted = city_encoded * 6

        # Combine features
        features = np.concatenate((
            np.array([[bhk_weighted, bathroom, furnished_numerical]]),
            address_tfidf,
            city_encoded_weighted
        ), axis=1)

        # Scale features
        features_scaled = scaler.transform(features)

        # Predict rent
        prediction = model.predict(features_scaled)[0]

        return jsonify({'predicted_price': prediction})

    except Exception as e:
        return jsonify({'error': str(e)})



















def extract_bhk_and_clean_title(title):
    bhk_match = re.search(r'(\d+)\s+BHK', title)  # Look for 'X BHK' where X is a number
    if bhk_match:
        bhk = int(bhk_match.group(1))  # Extract the numeric part
        title = re.sub(r'\d+\s+BHK', '', title).strip()  # Remove 'X BHK' and clean up
        return bhk, title
    return None, title  # If no match is found, return None for BHK and keep the original title

# Preprocessing function for the input data
def preprocess_data(data):
    # Extract and preprocess 'Area', 'Price', 'Title', 'City', and 'bhk'
    area = data.get("Area", 0)
    price = data.get("Price", 0)
    title = data.get("Title", "")
    city = data.get("City", "")
    bhk = data.get("bhk", 0)
    
    # Encode the 'City' column using label encoding
    city_encoded = label_encoder_city.transform([city])[0]

    # Extract bhk and clean title using the function
    bhk_extracted, cleaned_title = extract_bhk_and_clean_title(title)
    bhk = bhk_extracted if bhk_extracted is not None else bhk  # Use extracted bhk if found

    # List of property types to check
    property_types = ['Flat', 'Apartment', 'Builder', 'Villa', 'Penthouse', 'House']

    # Check if title contains any of the property types
    property_type = None
    for word in property_types:
        if word.lower() in title.lower():  # Case insensitive search
            property_type = word
            break  # Stop once a match is found
    
    # If no property type is found, use the first word of the title
    if property_type is None:
        property_type = 'Flat'

    # Encode the 'PropertyType' column using label encoding
    property_type_encoded = label_encoder_property_type.transform([property_type])[0]

    # Assume you would use the 'Title' for TF-IDF vectorization
    title_vectorized = tfidf_vectorizer_sale.transform([cleaned_title]).toarray()

    # Combine all features into a single array for the model
    features = np.array([area, price, bhk, city_encoded, property_type_encoded] + title_vectorized.flatten().tolist())

    return features

@app.route('/predict-sale', methods=['POST'])
def predict():
    # Get input data from the request
    data = request.get_json()

    # Preprocess the input data
    features = preprocess_data(data)

    # Check the shape of the features
    print(f"Shape of features before reshaping: {features.shape}")

    # Reshape to match model input requirements
    features = features.reshape(1, -1)

    # Ensure that the feature set matches the number of features the model was trained on
    expected_feature_size = best_model.n_features_in_
    if features.shape[1] != expected_feature_size:
        if features.shape[1] > expected_feature_size:
            # Trim extra features if necessary
            features = features[:, :expected_feature_size]
        else:
            # Pad missing features with zeros if necessary
            padding = np.zeros((1, expected_feature_size - features.shape[1]))
            features = np.hstack((features, padding))

    # Make prediction using the best model
    prediction = best_model.predict(features)

    # Return the prediction as JSON
    return jsonify({"predicted_price": prediction[0]})




if __name__ == '__main__':
    app.run(debug=True)
