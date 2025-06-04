import { useRecoilState } from "recoil";
import {
  accumulatedPanState,
  cropSizeState,
  editingModeState,
  imageBoundsState,
  imageDataState,
  imageScaleFactorState,
  processingState,
} from "../Store";
import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";

export const usePerformCrop = () => {
  const [accumulatedPan] = useRecoilState(accumulatedPanState);
  const [imageBounds] = useRecoilState(imageBoundsState);
  const [imageScaleFactor] = useRecoilState(imageScaleFactorState);
  const [cropSize] = useRecoilState(cropSizeState);
  const [, setProcessing] = useRecoilState(processingState);
  const [imageData, setImageData] = useRecoilState(imageDataState);
  const [, setEditingMode] = useRecoilState(editingModeState);

  return async () => {
    try {
      const croppingBounds = {
        originX: Math.round((accumulatedPan.x - imageBounds.x) * imageScaleFactor),
        originY: Math.round((accumulatedPan.y - imageBounds.y) * imageScaleFactor),
        width: Math.round(cropSize.width * imageScaleFactor),
        height: Math.round(cropSize.height * imageScaleFactor),
      };
      setProcessing(true);
      const cropResult = await ImageManipulator.manipulateAsync(imageData.uri, [{ crop: croppingBounds }]);
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
