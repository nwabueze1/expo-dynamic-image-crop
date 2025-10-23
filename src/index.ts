// Main export file for expo-dynamic-image-crop
export { ImageEditor, ImageEditorView } from "./ImageEditor";
export type {
  ImageEditorProps,
  ImageData,
  EditorOptions,
  MaterialIconNames,
  FeatherIconNames,
} from "./types";

// Optional: Export individual components if users want to use them separately
export { ControlBar } from "./ControlBar";
export { EditingWindow } from "./EditingWindow";
export { ImageCropOverlay } from "./ImageCropOverlay";
export { Processing } from "./Processing";
export { CropperModal } from "./CropperModal";

// Export hooks and context for advanced usage
export { usePerformCrop } from "./hooks/usePerformCrop";
export { EditorContext } from "./context/editor";
export type { EditorContextData } from "./context/editor";

// Note: Recoil atoms are intentionally not exported to keep the package self-contained
// Users should not need to manage the internal state directly
