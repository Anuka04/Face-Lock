from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization, GlobalAveragePooling2D

class EnhancedLivenessNet:
    @staticmethod
    def build(width, height, depth, classes):
        model = Sequential()
        
        # First convolutional block
        model.add(Conv2D(32, (3, 3), activation='relu', input_shape=(height, width, depth)))
        model.add(BatchNormalization())
        model.add(MaxPooling2D((2, 2)))
        
        # Second convolutional block
        model.add(Conv2D(64, (3, 3), activation='relu'))
        model.add(BatchNormalization())
        model.add(MaxPooling2D((2, 2)))
        
        # Third convolutional block
        model.add(Conv2D(128, (3, 3), activation='relu'))
        model.add(BatchNormalization())
        model.add(MaxPooling2D((2, 2)))
        
        # Fourth convolutional block
        model.add(Conv2D(256, (3, 3), activation='relu'))
        model.add(BatchNormalization())
        model.add(MaxPooling2D((2, 2)))
        
        model.add(GlobalAveragePooling2D())
        
        # Dense layers with dropout
        model.add(Dense(256, activation='relu'))
        model.add(Dropout(0.4))
        
        model.add(Dense(128, activation='relu'))
        model.add(Dropout(0.4))
        
        # Output layer
        model.add(Dense(classes, activation='softmax'))
        
        return model
