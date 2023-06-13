from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from dotenv import load_dotenv
import os

import cv2
import face_recognition
import numpy as np
import base64
import io
from PIL import Image

load_dotenv()

app = Flask(__name__)
db = os.getenv("DB")

app.config['MONGO_DBNAME'] = 'facedata'
app.config['MONGO_URI'] = db
app.config['JWT_SECRET_KEY'] = 'secret'

client = MongoClient(app.config['MONGO_URI'])
db = client[app.config['MONGO_DBNAME']]

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

faces = db.faces

def base64_to_numpy(base64_string):
    # Remove the data URL prefix
    encoded_image = base64_string.split(",")[1]

    # Decode the base64 string to bytes
    image_bytes = base64.b64decode(encoded_image)

    # Create a BytesIO object to wrap the image bytes
    image_stream = io.BytesIO(image_bytes)

    # Open the image using PIL (Python Imaging Library)
    pil_image = Image.open(image_stream)

    # Convert PIL image to NumPy array
    numpy_array = np.array(pil_image)

    return numpy_array

# Load the image and convert it to RGB format
def extract_and_store_faces(image_path):
    image = face_recognition.load_image_file(image_path)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Detect faces in the image
    face_locations = face_recognition.face_locations(rgb_image)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

    # Iterate over detected faces
    for face_encoding, face_location in zip(face_encodings, face_locations):
        # Store face encoding in MongoDB
        faces.insert_one({'encoding': face_encoding.tolist(), 'location': face_location})

# Compare faces in the webcam stream with the stored encodings
def compare_faces(frames):
    matches = 0
    non_matches = 0

    for frame in frames:
        image = base64_to_numpy(frame)
        rgb_frame = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


        # Detect faces in the frame
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        # Iterate over detected faces
        for face_encoding, frame_face_location in zip(face_encodings, face_locations):
            cursor = faces.find()
            for document in cursor:
                stored_encoding = document['encoding']
                stored_encoding = np.array(stored_encoding)
                match = face_recognition.compare_faces([stored_encoding], face_encoding)
                if match[0]:
                    matches += 1
                else:
                    non_matches += 1
    
    if matches > non_matches:
        print("MATCH!!!!!!!!!!!")
        response = {'result': 'Match found!'}
    else:
        print("NO MATCH D:")
        response = {'result': 'No match found!'}
    return response

# Route for face recognition
@app.route('/facerec_data', methods=['POST'])
def face_recognition_route():
    # Check if the request contains frames data

    frames = request.get_json()['frames']

    # Extract and store faces from the image
    image_path = '../face_rec/anoushka.jpg'
    extract_and_store_faces(image_path)

    # Perform face recognition on the captured frames
    prediction = compare_faces(frames)
    result ={
        'prediction':prediction
    }
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True,port=5001)
