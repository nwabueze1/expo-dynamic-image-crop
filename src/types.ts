import { ReactNode, ComponentProps } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export type MaterialIconNames = ComponentProps<typeof MaterialIcons>["name"];
export type FeatherIconNames = ComponentProps<typeof Feather>["name"];

export type ImageData = {
  uri: string;
  width: number;
  height: number;
};

/**
 * Actions available to custom control bar components
 */
export type ControlBarActions = {
  /**
   * Cancels the editing process and closes the editor
   */
  onCancel: () => void;
  /**
   * Performs the crop operation
   * @returns Promise that resolves when crop is complete
   */
  onCrop: () => Promise<void>;
  /**
   * Saves the cropped/edited image
   */
  onSave: () => void;
  /**
   * Goes back from edit mode to crop mode
   */
  onBack: () => void;
  /**
   * Current editing state
   * - false: cropping mode (before crop)
   * - true: edit mode (after crop)
   */
  isEdit: boolean;
};

/**
 * Image bounds information
 */
export type ImageBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Pan offset information
 */
export type Pan = {
  x: number;
  y: number;
};

/**
 * Crop size information
 */
export type CropSize = {
  width: number;
  height: number;
};

/**
 * Detailed crop information (for advanced usage)
 */
export type CropInfo = {
  cropSize: CropSize;
  imageBounds: ImageBounds;
  accumulatedPan: Pan;
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

/**
 * Props for the ImageEditor component
 */
export type ImageEditorProps = {
  editorOptions?: EditorOptions;
  minimumCropDimensions?: { width: number; height: number };
  fixedAspectRatio?: number;
  dynamicCrop?: boolean;
  onEditingCancel: () => void;
  onEditingComplete: (imageData: ImageData) => void;
  imageUri: string | null;
  processingComponent?: ReactNode;
  /**
   * Controls the visibility of the modal wrapper.
   * Only required when using ImageEditor component with modal (default behavior).
   * Not needed when using ImageEditorView directly or when useModal is false.
   */
  isVisible?: boolean;
  /**
   * Determines whether to wrap the editor in a modal.
   * @default true
   *
   * - When true (default): Editor is wrapped in a modal, requires isVisible prop
   * - When false: Editor renders inline without modal wrapper, isVisible prop is ignored
   *
   * @example
   * // With modal (default)
   * <ImageEditor isVisible={showEditor} ... />
   *
   * @example
   * // Inline without modal
   * <ImageEditor useModal={false} ... />
   */
  useModal?: boolean;
  /**
   * Custom control bar component that receives action callbacks
   * When provided, replaces the default control bar
   *
   * @param actions - Object containing all available actions and state
   * @returns React element to render as control bar
   *
   * @example
   * <ImageEditor
   *   customControlBar={(actions) => (
   *     <View>
   *       <Button onPress={actions.onCancel} title="Cancel" />
   *       {!actions.isEdit ? (
   *         <Button onPress={actions.onCrop} title="Crop" />
   *       ) : (
   *         <Button onPress={actions.onSave} title="Save" />
   *       )}
   *     </View>
   *   )}
   * />
   */
  customControlBar?: (actions: ControlBarActions) => ReactNode;
};
