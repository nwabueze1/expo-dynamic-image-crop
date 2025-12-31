// Main export file for expo-dynamic-image-crop
export { ImageEditor, ImageEditorView } from "./ImageEditor";
export type {
  ImageEditorProps,
  ImageData,
  EditorOptions,
  MaterialIconNames,
  FeatherIconNames,
  ControlBarActions,
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

// Advanced: Editor State Hooks
// These hooks provide safe, read-only access to editor state
// Use these for building custom UI or reacting to editor state changes
export {
  useEditorProcessing,
  useEditorReady,
  useEditorImageData,
  useEditorMode,
  useEditorCropInfo,
} from "./hooks/useEditorState";

// Export types for advanced usage
export type { CropInfo, CropSize, ImageBounds, Pan } from "./types";

// Note: The internal Zustand store (useEditorStore) is intentionally not exported
// to prevent misuse and ensure API stability. Use the hooks above instead.
