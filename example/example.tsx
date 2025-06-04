import React, { useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageEditor } from "./index";

export default function ImageCropExample() {
  const [image, setImage] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [cropMode, setCropMode] = useState<"square" | "dynamic" | "landscape">("dynamic");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setShowEditor(true);
    }
  };

  const getCropConfig = () => {
    switch (cropMode) {
      case "square":
        return { fixedAspectRatio: 1, dynamicCrop: false };
      case "landscape":
        return { fixedAspectRatio: 16 / 9, dynamicCrop: false };
      case "dynamic":
        return { dynamicCrop: true };
      default:
        return { dynamicCrop: true };
    }
  };

  return (
    <View style={styles.container}>
      <ImageEditor
        isVisible={showEditor}
        {...getCropConfig()}
        onEditingCancel={() => setShowEditor(false)}
        onEditingComplete={(croppedImage) => {
          setShowEditor(false);
          setImage(croppedImage.uri);
        }}
        imageUri={image}
        minimumCropDimensions={{ width: 100, height: 100 }}
        editorOptions={{
          backgroundColor: "#000",
          controlBar: {
            position: "top",
            backgroundColor: "#333",
            height: 80,
          },
        }}
      />

      {image ? (
        <View>
          <Image
            source={{ uri: image }}
            style={styles.image}
          />

          {/* Crop Mode Selection */}
          <Text style={styles.sectionTitle}>Crop Mode:</Text>
          <View style={styles.modeContainer}>
            {(["dynamic", "square", "landscape"] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeButton, cropMode === mode && styles.activeModeButton]}
                onPress={() => setCropMode(mode)}
              >
                <Text style={[styles.modeButtonText, cropMode === mode && styles.activeModeButtonText]}>
                  {mode === "dynamic" ? "Free Form" : mode === "square" ? "Square" : "Landscape"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={pickImage}
          >
            <Text style={styles.buttonText}>Pick New Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowEditor(true)}
          >
            <Text style={styles.buttonText}>
              Edit Image ({cropMode === "dynamic" ? "Free Form" : cropMode === "square" ? "Square" : "Landscape"})
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={pickImage}
          >
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            This example demonstrates:
            {"\n"}• Free Form: Resize width and height independently
            {"\n"}• Square: Fixed 1:1 aspect ratio
            {"\n"}• Landscape: Fixed 16:9 aspect ratio
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 150,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modeContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
  },
  activeModeButton: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "500",
  },
  activeModeButtonText: {
    color: "white",
  },
  description: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 20,
  },
});
