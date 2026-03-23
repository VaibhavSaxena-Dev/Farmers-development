import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
tf.config.set_visible_devices([], 'GPU')
import numpy as np
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from PIL import Image
import io

app = Flask(__name__)
CORS(app, origins='*')

# Load model
model = tf.keras.models.load_model('chicken_disease_model.h5')
classes = ['Coccidiosis', 'Healthy', 'New Castle Disease', 'Salmonella']

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    
    try:
        # Read and preprocess image
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((224, 224))
        img_array = img_to_array(img)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        prediction = model.predict(img_array)
        class_index = np.argmax(prediction[0])
        confidence = float(prediction[0][class_index])
        
        return jsonify({
            'disease': classes[class_index],
            'confidence': confidence,
            'all_predictions': {
                classes[i]: float(prediction[0][i]) 
                for i in range(len(classes))
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': True})

if __name__ == '__main__':
    print("Starting Chicken Disease Prediction API...")
    print("Model loaded successfully!")
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

@app.route("/")
def home():
    return "ML service is running successfully!"
