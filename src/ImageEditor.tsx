import React from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { ReactNode, useCallback, useEffect } from "react";
import { Modal, StatusBar, StyleSheet, View } from "react-native";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { ImageEditorProps } from "./types";
import { EditorContext } from "./context/editor";
import { ControlBar } from "./ControlBar";
import { EditingWindow } from "./EditingWindow";
import { Processing } from "./Processing";
import {
  editingModeState,
  editorOptionsState,
  imageDataState,
  isEditState,
  processingState,
  readyState,
} from "./Store";

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
  const [options, setOptions] = useRecoilState(editorOptionsState);
  const [imageData, setImageData] = useRecoilState(imageDataState);
  const [, setReady] = useRecoilState(readyState);
  const [, setEditingMode] = useRecoilState(editingModeState);
  const [, setProcessing] = useRecoilState(processingState);
  const [isEdit] = useRecoilState(isEditState);

  const initialize = useCallback(async () => {
    setProcessing(true);
    if (imageUri) {
      const { width: pickerWidth, height: pickerHeight } = await ImageManipulator.manipulateAsync(imageUri, []);

      setImageData({
        uri: imageUri,
        width: pickerWidth,
        height: pickerHeight,
      });

      setReady(true);
      setProcessing(false);
    }
  }, []);

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

          // console.log(JSON.stringify(custom, null, 2))
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
  const [ready] = useRecoilState(readyState);
  const [processing] = useRecoilState(processingState);
  const { backgroundColor, controlBar } = useRecoilValue(editorOptionsState);

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
  return (
    <Modal
      visible={isVisible}
      style={styles.modalContainer}
    >
      <RecoilRoot>
        <ImageEditorCore {...props} />
      </RecoilRoot>
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
