# Import the necessary libraries
from imutils.video import VideoStream
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
import numpy as np
import imutils
import pickle
import time
import cv2
import os

# Define the paths to the trained model, label encoder, and face detector
model_path = "liveness.model"
le_path = "le.pickle"
detector_path = "face_detector"

# Set the minimum probability to filter weak detections
confidence1 = 0.5

# Set the duration for face capture (in seconds)
capture_duration = 5

# Load the face detector model from disk
print("[INFO] Loading face detector...")
protoPath = os.path.sep.join([detector_path, "deploy.prototxt"])
modelPath = os.path.sep.join([detector_path, "res10_300x300_ssd_iter_140000.caffemodel"])
net = cv2.dnn.readNetFromCaffe(protoPath, modelPath)

# Load the liveness detection model and label encoder from disk
print("[INFO] Loading liveness detector...")
model = load_model(model_path)
le = pickle.loads(open(le_path, "rb").read())

# Initialize the video stream and allow the camera sensor to warm up
print("[INFO] Starting video stream...")
vs = VideoStream(src=0).start()
time.sleep(2.0)

# Initialize variables for face capture
start_time = time.time()
captured_frames = []

# Loop over the frames from the video stream
while True:
    # Grab the frame from the threaded video stream and resize it
    # to have a maximum width of 600 pixels
    frame = vs.read()
    frame = imutils.resize(frame, width=600)

    # Grab the frame dimensions and convert it to a blob
    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))

    # Pass the blob through the network and obtain the detections and predictions
    net.setInput(blob)
    detections = net.forward()

    # Loop over the detections
    for i in range(0, detections.shape[2]):
        # Extract the confidence (i.e., probability) associated with the prediction
        confidence = detections[0, 0, i, 2]

        # Filter out weak detections
        if confidence > confidence1:
            # Compute the (x, y)-coordinates of the bounding box for the face and extract the face ROI
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")

            # Ensure the detected bounding box does not fall outside the dimensions of the frame
            startX = max(0, startX)
            startY = max(0, startY)
            endX = min(w, endX)
            endY = min(h, endY)

            # Extract the face ROI and preprocess it in the same manner as the training data
            face = frame[startY:endY, startX:endX]
            face = cv2.resize(face, (32, 32))
            face = face.astype("float") / 255.0
            face = img_to_array(face)
            face = np.expand_dims(face, axis=0)

            # Add the face frame to the captured frames list
            captured_frames.append(face)

    # Show the output frame and wait for a key press
    cv2.imshow("Frame", frame)
    key = cv2.waitKey(1) & 0xFF

    # Check if the capture duration has been reached
    elapsed_time = time.time() - start_time
    if elapsed_time >= capture_duration:
        # Break from the loop to perform liveness detection on captured frames
        break

# Convert the captured frames to a numpy array
captured_frames = np.vstack(captured_frames)

# Perform liveness detection on the captured frames
preds = model.predict(captured_frames)

# Average the predictions for each frame
avg_preds = np.average(preds, axis=0)

# Get the predicted label with the highest probability
pred_label = le.classes_[np.argmax(avg_preds)]
pred_prob = avg_preds[np.argmax(avg_preds)]

# Print the prediction result
print("Prediction: {}: {:.4f}".format(pred_label, pred_prob))

# Clean up
cv2.destroyAllWindows()
vs.stop()
