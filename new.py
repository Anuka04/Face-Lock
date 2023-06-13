import cv2
import face_recognition
from pymongo import MongoClient
import numpy as np

# Connect to MongoDB
client = MongoClient('mongodb+srv://anushree:kJNeGPAUHdnmU4N2@cluster0.wk72xjc.mongodb.net/database_faces?retryWrites=true&w=majority')
db = client['db_faces']
collection = db['shree']

# Load the image and convert it to RGB format
def extract_and_store_faces(image_path):
    image = face_recognition.load_image_file(image_path)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Detect faces in the image
    face_locations = face_recognition.face_locations(rgb_image)

    # Iterate over detected faces
    for face_location in face_locations:
        # Extract the face encoding
        face_encoding = face_recognition.face_encodings(rgb_image, [face_location])[0]

        # Store face encoding in MongoDB
        collection.insert_one({'encoding': face_encoding.tolist()})

# Compare faces in the webcam stream with the stored encodings
def compare_faces():
    video_capture = cv2.VideoCapture(0)

    while True:
        # Capture frame-by-frame
        ret, frame = video_capture.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detect faces in the frame
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        # Iterate over detected faces
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # Compare the face encoding with the stored encodings
            cursor = collection.find()
            for document in cursor:
                stored_encoding = document['encoding']
                stored_encoding = np.array(stored_encoding)
                match = face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=0.38)
                if match[0]:
                    print("Match found!")
                else:
                    print("No match found!")

        # Display the resulting image
        cv2.imshow('Video', frame)

        # Quit on 'q' press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the video capture
    video_capture.release()
    cv2.destroyAllWindows()

# Run the functions
extract_and_store_faces('img.jfif')
compare_faces()

