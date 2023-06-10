from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import pickle
import cv2
import os
import base64
from statistics import mode

app = Flask(__name__)

# Load the face detector model
detector_path = "liveness-detection/face_detector"
protoPath = os.path.sep.join([detector_path, "deploy.prototxt"])
modelPath = os.path.sep.join([detector_path, "res10_300x300_ssd_iter_140000.caffemodel"])
net = cv2.dnn.readNetFromCaffe(protoPath, modelPath)

# Load the liveness detection model and label encoder
model = load_model("liveness-detection/liveness.model")
le = pickle.loads(open("liveness-detection/le.pickle", "rb").read())

@app.route("/liveness_detection", methods=["POST"])
def liveness_detection():
    frames = request.json["frames"]
    processed_frames = []
    processed_frames_with_boxes = []

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
                cv2.rectangle(image, (startX, startY), (endX, endY), (0, 255, 0), 2)

                # Extract the face ROI
                face = image[startY:endY, startX:endX]

                # Preprocess the face
                face = cv2.resize(face, (32, 32))
                face = face.astype("float") / 255.0
                face = img_to_array(face)
                face = np.expand_dims(face, axis=0)

                processed_frames.append(face)
        
        processed_frames_with_boxes.append(image)

        # Check if we have processed at least 10 frames
        if len(processed_frames) >= 10:
            break

    # Convert the captured frames to a numpy array
    processed_frames = np.vstack(processed_frames)

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
    
    # Prepare the response
    response = {
        'prediction': class_labels[mode_label],
        'probability': float(average_probability)  # Convert to float
    }

    # # Display the frames with bounding boxes
    # for frame_with_boxes in processed_frames_with_boxes:
    #     cv2.imshow("Frame", frame_with_boxes)
    #     key = cv2.waitKey(0) & 0xFF
    #     if key == ord("q"):  # Press 'q' to quit
    #         break
    #     elif key == ord("n"):  # Press 'n' to move to the next frame
    #         continue
    #     cv2.destroyAllWindows()

    return jsonify(response)

if __name__ == "__main__":
    app.run()
