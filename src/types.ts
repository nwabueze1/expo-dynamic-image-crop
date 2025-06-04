import { ReactNode, ComponentProps } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export type MaterialIconNames = ComponentProps<typeof MaterialIcons>["name"];
export type FeatherIconNames = ComponentProps<typeof Feather>["name"];

export type ImageData = {
  uri: string;
  width: number;
  height: number;
};

type IconProps = {
  color: string;
  text: string;
  iconName: FeatherIconNames | MaterialIconNames;
};

export type EditorOptions = {
  backgroundColor?: string;
  controlBar?: {
    position?: "top" | "bottom";
    backgroundColor?: string;
    height?: number;
    cancelButton?: IconProps;
    cropButton?: IconProps;
    backButton?: IconProps;
    saveButton?: IconProps;
  };
  coverMarker?: {
    show?: boolean;
    color?: string;
  };
  gridOverlayColor?: string;
  overlayCropColor?: string;
};

export type ImageEditorProps = {
  editorOptions?: EditorOptions;
  minimumCropDimensions?: { width: number; height: number };
  fixedAspectRatio?: number;
  dynamicCrop?: boolean;
  onEditingCancel: () => void;
  onEditingComplete: (imageData: ImageData) => void;
  imageUri: string | null;
  processingComponent?: ReactNode;
  isVisible: boolean;
};
