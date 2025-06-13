import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ImageCropOverlay } from "./ImageCropOverlay";
import { useEditorStore } from "./store";

type Layout = {
  width: number;
  height: number;
};

export function EditingWindow() {
  const [imageLayout, setImageLayout] = useState<Layout | null>(null);
  const imageData = useEditorStore((s) => s.imageData);
  const setImageBounds = useEditorStore((s) => s.setImageBounds);
  const setImageScaleFactor = useEditorStore((s) => s.setImageScaleFactor);
  const editingMode = useEditorStore((s) => s.editingMode);
  const isCropping = editingMode === "crop";

  const getImageFrame = (layout: Layout) => {
    onUpdateCropLayout(layout);
  };

  const onUpdateCropLayout = (layout: Layout | null) => {
    if (layout) {
      const editingWindowAspectRatio = layout.height / layout.width;
      const imageAspectRatio = imageData.height / imageData.width;
      const bounds = { x: 0, y: 0, width: 0, height: 0 };
      let imageScaleFactor = 1;
      if (imageAspectRatio > editingWindowAspectRatio) {
        bounds.x =
          (((imageAspectRatio - editingWindowAspectRatio) / imageAspectRatio) *
            layout.width) /
          2;
        bounds.width = layout.height / imageAspectRatio;
        bounds.height = layout.height;
        imageScaleFactor = imageData.height / layout.height;
      } else {
        bounds.y =
          (((1 / imageAspectRatio - 1 / editingWindowAspectRatio) /
            (1 / imageAspectRatio)) *
            layout.height) /
          2;
        bounds.width = layout.width;
        bounds.height = layout.width * imageAspectRatio;
        imageScaleFactor = imageData.width / layout.width;
      }
      setImageBounds(bounds);
      setImageScaleFactor(imageScaleFactor);
      setImageLayout({
        height: layout.height,
        width: layout.width,
      });
    }
  };

  useEffect(() => {
    onUpdateCropLayout(imageLayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData]);

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{ uri: imageData.uri }}
        onLayout={({ nativeEvent }) => getImageFrame(nativeEvent.layout)}
      />
      {isCropping && imageLayout != null ? <ImageCropOverlay /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "contain",
  },
  glContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
