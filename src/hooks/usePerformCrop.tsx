import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";
import { useEditorStore } from "../store";

export const usePerformCrop = () => {
  const accumulatedPan = useEditorStore((s) => s.accumulatedPan);
  const imageBounds = useEditorStore((s) => s.imageBounds);
  const imageScaleFactor = useEditorStore((s) => s.imageScaleFactor);
  const cropSize = useEditorStore((s) => s.cropSize);
  const setProcessing = useEditorStore((s) => s.setProcessing);
  const imageData = useEditorStore((s) => s.imageData);
  const setImageData = useEditorStore((s) => s.setImageData);
  const setEditingMode = useEditorStore((s) => s.setEditingMode);

  return async () => {
    try {
      const croppingBounds = {
        originX: Math.round(
          (accumulatedPan.x - imageBounds.x) * imageScaleFactor
        ),
        originY: Math.round(
          (accumulatedPan.y - imageBounds.y) * imageScaleFactor
        ),
        width: Math.round(cropSize.width * imageScaleFactor),
        height: Math.round(cropSize.height * imageScaleFactor),
      };
      setProcessing(true);
      const cropResult = await ImageManipulator.manipulateAsync(imageData.uri, [
        { crop: croppingBounds },
      ]);
      const { uri, width, height } = cropResult;
      setImageData({ uri, width, height });
      setProcessing(false);
      setEditingMode("operation-select");
    } catch (error) {
      setProcessing(false);
      Alert.alert("An error occurred while editing.");
    }
  };
};
