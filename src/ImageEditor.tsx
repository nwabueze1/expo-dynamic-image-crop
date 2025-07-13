import React, { useRef, useState } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { ReactNode, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { ImageEditorProps } from "./types";
import { EditorContext } from "./context/editor";
import { ControlBar } from "./ControlBar";
import { EditingWindow } from "./EditingWindow";
import { Processing } from "./Processing";
import { useEditorStore } from "./store";

function ImageEditorCore(props: Omit<ImageEditorProps, "isVisible">) {
  const {
    minimumCropDimensions = { width: 100, height: 100 },
    fixedAspectRatio = 0.66666666666,
    dynamicCrop = false,
    onEditingCancel,
    onEditingComplete,
    imageUri = null,
    processingComponent,
    editorOptions,
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
      <ImageEditorView processingComponent={processingComponent} />
    </EditorContext.Provider>
  );
}

type Props = {
  processingComponent?: ReactNode;
};

export function ImageEditorView({ processingComponent }: Props) {
  const ready = useEditorStore((s) => s.ready);
  const processing = useEditorStore((s) => s.processing);
  const { backgroundColor, controlBar } = useEditorStore(
    (s) => s.editorOptions
  );

  return (
    <>
      {ready && (
        <View style={[styles.container, { backgroundColor }]}>
          {controlBar?.position === "top" && <ControlBar />}
          <EditingWindow />
          {controlBar?.position === "bottom" && <ControlBar />}
        </View>
      )}

      {processing && <Processing customComponent={processingComponent} />}
    </>
  );
}

export function ImageEditor({ isVisible, ...props }: ImageEditorProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setOpen(true);
      }, 250);
    } else {
      setOpen(false);
    }
  }, [isVisible]);

  return (
    <View style={styles.root}>
      <Modal visible={open} style={styles.modalContainer}>
        <ImageEditorCore {...props} />
      </Modal>
    </View>
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
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
