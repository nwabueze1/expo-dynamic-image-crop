import { create } from "zustand";
import { EditorOptions } from "./types";

interface ImageData {
  uri: string;
  width: number;
  height: number;
}

interface ImageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Pan {
  x: number;
  y: number;
}

interface CropSize {
  width: number;
  height: number;
}

/**
 * Internal Zustand store for the image editor
 *
 * WARNING: This store is for internal use only.
 * Direct access to this store is not recommended for most users.
 *
 * For safe, read-only access to editor state, use the hooks from:
 * - useEditorProcessing()
 * - useEditorReady()
 * - useEditorImageData()
 * - useEditorMode()
 * - useEditorCropInfo()
 *
 * These hooks provide a stable API that won't break with internal changes.
 */
export interface EditorStore {
  // Safe to read (exposed via hooks)
  /** Current image data - use useEditorImageData() for safe access */
  imageData: ImageData;
  /** Internal setter - do not use directly */
  setImageData: (data: ImageData) => void;

  /** Internal scale factor - do not use directly */
  imageScaleFactor: number;
  /** Internal setter - do not use directly */
  setImageScaleFactor: (factor: number) => void;

  /** Image bounds - use useEditorCropInfo() for safe access */
  imageBounds: ImageBounds;
  /** Internal setter - do not use directly */
  setImageBounds: (bounds: ImageBounds) => void;

  /** Ready state - use useEditorReady() for safe access */
  ready: boolean;
  /** Internal setter - do not use directly */
  setReady: (ready: boolean) => void;

  /** Processing state - use useEditorProcessing() for safe access */
  processing: boolean;
  /** Internal setter - do not use directly */
  setProcessing: (processing: boolean) => void;

  /** Accumulated pan - use useEditorCropInfo() for safe access */
  accumulatedPan: Pan;
  /** Internal setter - do not use directly */
  setAccumulatedPan: (pan: Pan) => void;

  /** Crop size - use useEditorCropInfo() for safe access */
  cropSize: CropSize;
  /** Internal setter - do not use directly */
  setCropSize: (size: CropSize) => void;

  /** Editing mode - use useEditorMode() for safe access */
  editingMode: string;
  /** Internal setter - do not use directly */
  setEditingMode: (mode: string) => void;

  /** Edit state - use useEditorMode() for safe access */
  isEdit: boolean;
  /** Internal setter - do not use directly */
  setIsEdit: (isEdit: boolean) => void;

  /** Editor options */
  editorOptions: EditorOptions;
  /** Internal setter - do not use directly */
  setEditorOptions: (options: EditorOptions) => void;

  /** Internal method - do not use directly */
  resetEditorStore: () => void;
}

const defaultEditorOptions: EditorOptions = {
  backgroundColor: "#222",
  overlayCropColor: "#33333355",
  gridOverlayColor: "#ffffff88",
  coverMarker: {
    show: true,
    color: "#fff",
  },
  controlBar: {
    position: "top",
    height: 80,
    backgroundColor: "#333",
    backButton: {
      color: "#fff",
      iconName: "arrow-back",
      text: "Back",
    },
    cropButton: {
      color: "#fff",
      iconName: "crop",
      text: "Crop",
    },
    saveButton: {
      color: "#fff",
      iconName: "done",
      text: "Save",
    },
    cancelButton: {
      color: "#fff",
      iconName: "cancel",
      text: "Cancel",
    },
  },
};

export const useEditorStore = create<EditorStore>((set) => ({
  imageData: { uri: "", width: 0, height: 0 },
  setImageData: (data) => set({ imageData: data }),
  imageScaleFactor: 1,
  setImageScaleFactor: (factor) => set({ imageScaleFactor: factor }),
  imageBounds: { x: 0, y: 0, width: 0, height: 0 },
  setImageBounds: (bounds) => set({ imageBounds: bounds }),
  ready: false,
  setReady: (ready) => set({ ready }),
  processing: false,
  setProcessing: (processing) => set({ processing }),
  accumulatedPan: { x: 0, y: 0 },
  setAccumulatedPan: (pan) => set({ accumulatedPan: pan }),
  cropSize: { width: 0, height: 0 },
  setCropSize: (size) => set({ cropSize: size }),
  editingMode: "crop",
  setEditingMode: (mode) => set({ editingMode: mode }),
  isEdit: false,
  setIsEdit: (isEdit) => set({ isEdit }),
  editorOptions: defaultEditorOptions,
  setEditorOptions: (options) => set({ editorOptions: options }),
  resetEditorStore: () =>
    set({
      imageData: { uri: "", width: 0, height: 0 },
      imageScaleFactor: 1,
      imageBounds: { x: 0, y: 0, width: 0, height: 0 },
      ready: false,
      processing: false,
      accumulatedPan: { x: 0, y: 0 },
      cropSize: { width: 0, height: 0 },
      editingMode: "crop",
      isEdit: false,
      editorOptions: defaultEditorOptions,
    }),
}));
