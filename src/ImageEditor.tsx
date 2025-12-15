import React, { useContext, useState } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { ReactNode, useCallback, useEffect } from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { ImageEditorProps, ControlBarActions } from "./types";
import { EditorContext } from "./context/editor";
import { ControlBar } from "./ControlBar";
import { EditingWindow } from "./EditingWindow";
import { Processing } from "./Processing";
import { useEditorStore } from "./store";
import { usePerformCrop } from "./hooks/usePerformCrop";

function ImageEditorCore(props: Omit<ImageEditorProps, "isVisible" | "useModal">) {
  const {
    minimumCropDimensions = { width: 100, height: 100 },
    fixedAspectRatio = 0.66666666666,
    dynamicCrop = false,
    onEditingCancel,
    onEditingComplete,
    imageUri = null,
    processingComponent,
    editorOptions,
    customControlBar,
  } = props;

  const options = useEditorStore((s) => s.editorOptions);
  const setOptions = useEditorStore((s) => s.setEditorOptions);
  const imageData = useEditorStore((s) => s.imageData);
  const setImageData = useEditorStore((s) => s.setImageData);
  const setReady = useEditorStore((s) => s.setReady);
  const setEditingMode = useEditorStore((s) => s.setEditingMode);
  const setProcessing = useEditorStore((s) => s.setProcessing);
  const isEdit = useEditorStore((s) => s.isEdit);
  const resetEditorStore = useEditorStore((s) => s.resetEditorStore);

  const initialize = useCallback(async () => {
    setProcessing(true);
    if (imageUri) {
      const { width: pickerWidth, height: pickerHeight } =
        await ImageManipulator.manipulateAsync(imageUri, []);
      setImageData({
        uri: imageUri,
        width: pickerWidth,
        height: pickerHeight,
      });
      setReady(true);
      setProcessing(false);
    }
  }, [imageUri, setImageData, setProcessing, setReady]);

  const onBackPress = () => {
    if (!isEdit) {
      onEditingCancel();
      resetEditorStore();
    } else {
      setProcessing(true);
      initialize().then(() => {
        setEditingMode("crop");
        setProcessing(false);
      });
    }
  };

  const onSave = () => {
    onEditingComplete(imageData);
    resetEditorStore();
  };

  useEffect(() => {
    initialize().then(setCustomStyles).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  function setCustomStyles() {
    if (editorOptions) {
      const custom = Object.assign({}, options);
      Object.entries(editorOptions).forEach(([key, value]) => {
        if (key) {
          // @ts-ignore
          if (typeof custom[key] === "object" && custom[key] !== null) {
            // @ts-ignore
            custom[key] = { ...custom[key], ...value };
          } else {
            // @ts-ignore
            custom[key] = value;
          }
        }
      });
      setOptions(custom);
    }
  }

  return (
    <EditorContext.Provider
      value={{
        minimumCropDimensions,
        fixedAspectRatio,
        dynamicCrop,
        onBackPress,
        onSave,
        imageUri,
      }}
    >
      <StatusBar hidden={true} />
      <ImageEditorView
        processingComponent={processingComponent}
        customControlBar={customControlBar}
      />
    </EditorContext.Provider>
  );
}

type Props = {
  processingComponent?: ReactNode;
  customControlBar?: (actions: ControlBarActions) => ReactNode;
};

export function ImageEditorView({
  processingComponent,
  customControlBar,
}: Props) {
  const ready = useEditorStore((s) => s.ready);
  const processing = useEditorStore((s) => s.processing);
  const isEdit = useEditorStore((s) => s.isEdit);
  const setIsEdit = useEditorStore((s) => s.setIsEdit);
  const { backgroundColor, controlBar } = useEditorStore(
    (s) => s.editorOptions
  );
  const { onBackPress, onSave } = useContext(EditorContext);
  const performCrop = usePerformCrop();

  // Create actions object for custom control bar
  const controlBarActions: ControlBarActions = {
    onCancel: () => {
      onBackPress();
      setIsEdit(false);
    },
    onCrop: async () => {
      await performCrop();
      setIsEdit(true);
    },
    onSave: onSave,
    onBack: () => {
      onBackPress();
      setIsEdit(false);
    },
    isEdit,
  };

  return (
    <>
      {ready && (
        <View style={[styles.container, { backgroundColor }]}>
          {/* Render custom control bar if provided, otherwise use default */}
          {customControlBar ? (
            <>
              {customControlBar(controlBarActions)}
              <EditingWindow />
            </>
          ) : (
            <>
              {controlBar?.position === "top" && <ControlBar />}
              <EditingWindow />
              {controlBar?.position === "bottom" && <ControlBar />}
            </>
          )}
        </View>
      )}

      {processing && <Processing customComponent={processingComponent} />}
    </>
  );
}

/**
 * Main ImageEditor component with optional modal wrapper
 *
 * @param props - ImageEditorProps
 * @param props.useModal - Whether to wrap editor in a modal (default: true)
 * @param props.isVisible - Modal visibility (required when useModal is true)
 *
 * @example
 * // With modal (default behavior)
 * <ImageEditor isVisible={showEditor} imageUri={uri} ... />
 *
 * @example
 * // Inline without modal
 * <ImageEditor useModal={false} imageUri={uri} ... />
 */
export function ImageEditor({
  isVisible,
  useModal = true,
  ...props
}: ImageEditorProps) {
  const [open, setOpen] = useState(false);
  const resetEditorStore = useEditorStore((s) => s.resetEditorStore);

  useEffect(() => {
    if (useModal && isVisible !== undefined) {
      if (isVisible) {
        setTimeout(() => {
          setOpen(true);
        }, 600);
      } else {
        resetEditorStore();
        setTimeout(() => {
          setOpen(false);
        }, 100);
      }
    }
  }, [isVisible, useModal, resetEditorStore]);

  // Inline mode: render directly without modal
  if (!useModal) {
    return <ImageEditorCore {...props} />;
  }

  // Modal mode: wrap in modal (default behavior)
  return (
    <Modal visible={open} style={styles.modalContainer}>
      <ImageEditorCore {...props} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    zIndex: 1,
  },
});
