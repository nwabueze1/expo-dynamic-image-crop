import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { IconButton } from "./components/IconButton";
import { EditorContext } from "./context/editor";
import { usePerformCrop } from "./hooks/usePerformCrop";
import { editorOptionsState, isEditState } from "./Store";

function ControlBar() {
  const [isEdit, setIsEdit] = useRecoilState(isEditState);
  const { controlBar } = useRecoilValue(editorOptionsState);
  const { onBackPress, onSave } = useContext(EditorContext);
  const performCrop = usePerformCrop();

  const onEditDone = async () => {
    await performCrop();
    setIsEdit(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: controlBar?.backgroundColor,
          height: controlBar?.height,
        },
      ]}
    >
      <IconButton
        iconID={
          !isEdit
            ? controlBar?.cancelButton?.iconName!
            : controlBar?.backButton?.iconName!
        }
        color={
          !isEdit
            ? controlBar?.cancelButton?.color!
            : controlBar?.backButton?.color!
        }
        text={
          !isEdit
            ? controlBar?.cancelButton?.text!
            : controlBar?.backButton?.text!
        }
        onPress={() => {
          onBackPress();
          setIsEdit(false);
        }}
      />
      {!isEdit ? (
        <IconButton
          iconID={controlBar?.cropButton?.iconName!}
          text={controlBar?.cropButton?.text!}
          color={controlBar?.cropButton?.color!}
          onPress={onEditDone}
        />
      ) : (
        <IconButton
          iconID={controlBar?.saveButton?.iconName!}
          text={controlBar?.saveButton?.text!}
          color={controlBar?.saveButton?.color!}
          onPress={onSave}
        />
      )}
    </View>
  );
}

export { ControlBar };

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
});
