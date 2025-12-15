/**
 * Advanced hooks for accessing editor state
 *
 * WARNING: These are advanced APIs intended for building custom UI components
 * or reacting to editor state changes. For most use cases, the standard
 * ImageEditor component props are sufficient.
 *
 * These hooks provide read-only access to the editor's internal state.
 * Do not attempt to modify the returned values directly.
 */

import { useEditorStore } from "../store";
import { ImageData, CropInfo } from "../types";

/**
 * Returns the current processing state of the editor
 *
 * @returns true when the editor is processing (cropping, loading, etc.)
 *
 * @example
 * ```tsx
 * function CustomLoadingIndicator() {
 *   const processing = useEditorProcessing();
 *   return processing ? <Spinner /> : null;
 * }
 * ```
 */
export function useEditorProcessing(): boolean {
  return useEditorStore((state) => state.processing);
}

/**
 * Returns whether the editor is ready to accept user input
 *
 * @returns true when the editor has finished initializing and is ready
 *
 * @example
 * ```tsx
 * function EditorStatus() {
 *   const ready = useEditorReady();
 *   return <Text>Status: {ready ? 'Ready' : 'Loading...'}</Text>;
 * }
 * ```
 */
export function useEditorReady(): boolean {
  return useEditorStore((state) => state.ready);
}

/**
 * Returns the current image data (read-only)
 *
 * WARNING: Do not modify the returned object. It is for display purposes only.
 *
 * @returns Object containing uri, width, and height of the current image
 *
 * @example
 * ```tsx
 * function ImageDimensions() {
 *   const imageData = useEditorImageData();
 *   return (
 *     <Text>
 *       Dimensions: {imageData.width} x {imageData.height}
 *     </Text>
 *   );
 * }
 * ```
 */
export function useEditorImageData(): ImageData {
  return useEditorStore((state) => state.imageData);
}

/**
 * Returns the current editing mode
 *
 * @returns Object with isEdit (boolean) and editingMode (string)
 * - isEdit: false during cropping, true after cropping
 * - editingMode: current mode ("crop" or "operation-select")
 *
 * @example
 * ```tsx
 * function ModeIndicator() {
 *   const { isEdit, editingMode } = useEditorMode();
 *   return (
 *     <Text>
 *       Mode: {isEdit ? 'Editing' : 'Cropping'} ({editingMode})
 *     </Text>
 *   );
 * }
 * ```
 */
export function useEditorMode(): { isEdit: boolean; editingMode: string } {
  const isEdit = useEditorStore((state) => state.isEdit);
  const editingMode = useEditorStore((state) => state.editingMode);
  return { isEdit, editingMode };
}

/**
 * Returns detailed crop information (advanced)
 *
 * WARNING: This is an advanced API. Most users should not need this.
 * The values are for display purposes only.
 *
 * @returns Object containing crop size, image bounds, and accumulated pan
 *
 * @example
 * ```tsx
 * function CropDimensions() {
 *   const { cropSize } = useEditorCropInfo();
 *   return (
 *     <Text>
 *       Crop: {Math.round(cropSize.width)} x {Math.round(cropSize.height)}
 *     </Text>
 *   );
 * }
 * ```
 */
export function useEditorCropInfo(): CropInfo {
  const cropSize = useEditorStore((state) => state.cropSize);
  const imageBounds = useEditorStore((state) => state.imageBounds);
  const accumulatedPan = useEditorStore((state) => state.accumulatedPan);

  return {
    cropSize,
    imageBounds,
    accumulatedPan,
  };
}
