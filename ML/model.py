import os
import numpy as np
import pandas as pd
import tensorflow as tf

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight

from tensorflow.keras.preprocessing.image import load_img, img_to_array, ImageDataGenerator
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau


print("TensorFlow version:", tf.__version__)
print("Training on CPU")
print()


# ================= LOAD CSV =================
csv_path = "train_data.csv"
image_folder = "Train"

df = pd.read_csv(csv_path)

print("Dataset Preview:")
print(df.head())
print("Columns in CSV:", df.columns)


# ================= ENCODE LABELS =================
le = LabelEncoder()
df['label_encoded'] = le.fit_transform(df['label'])

num_classes = len(df['label'].unique())
print("Classes:", le.classes_)


# ================= LOAD IMAGES =================
IMG_SIZE = 224
images_list = []
labels_list = []

for index, row in df.iterrows():
    img_path = os.path.join(image_folder, row['images'])

    if not os.path.exists(img_path):
        print(f"Warning: {img_path} not found")
        continue

    img = load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img = img_to_array(img)
    img = preprocess_input(img)

    images_list.append(img)
    labels_list.append(row['label_encoded'])

X = np.array(images_list)
y = to_categorical(labels_list, num_classes)

print("Total images loaded:", len(X))


# ================= TRAIN TEST SPLIT =================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ================= CLASS WEIGHTS =================
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(labels_list),
    y=labels_list
)

class_weights = dict(enumerate(class_weights))
print("Class Weights:", class_weights)


# ================= DATA AUGMENTATION =================
datagen = ImageDataGenerator(
    rotation_range=15,
    zoom_range=0.15,
    horizontal_flip=True
)


# ================= BUILD MODEL =================
base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()


# ================= CALLBACKS =================
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=4,
    restore_best_weights=True
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.3,
    patience=2
)


# ================= TRAIN PHASE 1 =================
history = model.fit(
    datagen.flow(X_train, y_train, batch_size=32),
    validation_data=(X_test, y_test),
    epochs=10,
    callbacks=[early_stop, reduce_lr],
    class_weight=class_weights
)


# ================= FINE TUNING =================
base_model.trainable = True

for layer in base_model.layers[:-20]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

history_fine = model.fit(
    datagen.flow(X_train, y_train, batch_size=32),
    validation_data=(X_test, y_test),
    epochs=6,
    callbacks=[early_stop, reduce_lr],
    class_weight=class_weights
)


# ================= EVALUATE =================
loss, acc = model.evaluate(X_test, y_test)
print("Final Test Accuracy:", acc)


# ================= SAVE MODEL =================
model.save("chicken_disease_model.h5")
print("Model Saved Successfully!")


# ================= PREDICTION FUNCTION =================
def predict_image(image_path):
    img = load_img(image_path, target_size=(224, 224))
    img = img_to_array(img)
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img)
    class_index = np.argmax(prediction)

    predicted_label = le.inverse_transform([class_index])[0]
    print("Prediction:", predicted_label)
    return predicted_label