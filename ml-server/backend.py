from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from dotenv import load_dotenv
import os
from flask_cors import cross_origin

# for the liveness
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import pickle
from statistics import mode

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

# Load the face detector model
protoPath = "../livenessmodels/face_detector/deploy.prototxt"
modelPath = "../livenessmodels/face_detector/res10_300x300_ssd_iter_140000.caffemodel"
net = cv2.dnn.readNetFromCaffe(protoPath, modelPath)

# Load the liveness detection model and label encoder
model = load_model("../livenessmodels/vgg.model")
le = pickle.loads(open("../livenessmodels/lev.pkl", "rb").read())

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
def compare_faces(frames, username):
    users = db.users
    matches = 0
    non_matches = 0

    for frame in frames:
        image = base64_to_numpy(frame)
        rgb_frame = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Detect faces in the frame
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        # Get the user's face encodings and locations from the database
        user = users.find_one({"username": username})
        print(username)
        if user:
            user_encodings = user['encodings']
            # print("SECOND:  ", encoding_user)
            # Iterate over detected faces
            for face_encoding, frame_face_location in zip(face_encodings, face_locations):
                match = face_recognition.compare_faces(user_encodings, face_encoding)
                print(match)
                if True in match:
                    matches += 1
                else:
                    non_matches += 1
    print(matches)
    response = {
        'result': 'Match found!' if matches > non_matches else 'No match found!',
        'matches': matches,
        'non_matches': non_matches
    }
    return response

# Function to process frames for liveness detection
def process_frames(frames):
    processed_frames = []

    for frame in frames:
        # Convert base64 string to image array
        encoded_image = frame.split(",")[1]
        decoded_image = base64.b64decode(encoded_image)
        np_array = np.frombuffer(decoded_image, dtype=np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        # Perform face detection
        (h, w) = image.shape[:2]
        blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
        net.setInput(blob)
        detections = net.forward()

        # Ensure at least one face is detected
        if detections.shape[2] > 0:
            # Get the face with the highest confidence
            i = np.argmax(detections[0, 0, :, 2])
            confidence = detections[0, 0, i, 2]

            # Filter out weak detections
            if confidence:
                # Compute the (x, y)-coordinates of the bounding box for the face
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")

                # Draw bounding box on the frame
                # cv2.rectangle(image, (startX, startY), (endX, endY), (0, 255, 0), 2)

                # Extract the face ROI
                face = image[startY:endY, startX:endX]

                # Preprocess the face
                face = cv2.resize(face, (32, 32))
                face = face.astype("float") / 255.0
                face = img_to_array(face)
                face = np.expand_dims(face, axis=0)

                processed_frames.append(face)

    # Convert the captured frames to a numpy array
    processed_frames = np.vstack(processed_frames)

    return processed_frames

# Route for face recognition
@app.route('/facerec_data', methods=['POST','GET'])
@cross_origin()
def face_recognition_route():
    try:
        data = request.get_json()
        frames = data['frames']
        username = data['username']

        # Perform face recognition on the captured frames
        prediction = compare_faces(frames, username)
        # result = {'prediction': prediction}
        print(prediction)
        # Process frames for liveness detection
        processed_frames = process_frames(frames)

        # Make predictions
        predictions = model.predict(processed_frames)

        # Convert predictions to class labels and probabilities
        class_labels = ['Fake', 'Real']
        predicted_labels = np.argmax(predictions, axis=1)
        probabilities = np.max(predictions, axis=1).tolist()
        predicted_classes = [class_labels[label] for label in predicted_labels]

        # Calculate the mode label and average probability
        mode_label = mode(predicted_labels)
        average_probability = np.mean(np.max(predictions, axis=1))
        average_probability = float(average_probability)*100
        # Prepare the response
        response = {
            'predictionliveness': class_labels[mode_label],
            'probability': average_probability,  # Convert to float
            'prediction' : prediction,
            # 'matches' : float(prediction['matches']),
            # 'non_matches' : float(prediction['non_matches']),
        }
        print(response)
        return jsonify(response)
        # return jsonify(result, response)

    except KeyError as e:
        error_message = f"Missing key in request data: {str(e)}"
        return jsonify({'error': error_message}), 400

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        return jsonify({'error': error_message}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)