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

export interface EditorStore {
  imageData: ImageData;
  setImageData: (data: ImageData) => void;
  imageScaleFactor: number;
  setImageScaleFactor: (factor: number) => void;
  imageBounds: ImageBounds;
  setImageBounds: (bounds: ImageBounds) => void;
  ready: boolean;
  setReady: (ready: boolean) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  accumulatedPan: Pan;
  setAccumulatedPan: (pan: Pan) => void;
  cropSize: CropSize;
  setCropSize: (size: CropSize) => void;
  editingMode: string;
  setEditingMode: (mode: string) => void;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  editorOptions: EditorOptions;
  setEditorOptions: (options: EditorOptions) => void;
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
