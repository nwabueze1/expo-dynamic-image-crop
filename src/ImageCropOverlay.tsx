import { useContext, useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import {
  GestureEvent,
  GestureHandlerRootView,
  HandlerStateChangeEvent,
  HandlerStateChangeEventPayload,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from "react-native-gesture-handler";
import { EditorContext } from "./context/editor";
import { useEditorStore } from "./store";

const horizontalSections = ["top", "middle", "bottom"];
const verticalSections = ["left", "middle", "right"];

type GestureHandlerEventPayloadType =
  GestureEvent<PanGestureHandlerEventPayload>;
type HandlerStateChangeEventType =
  HandlerStateChangeEvent<PanGestureHandlerEventPayload>;

const ImageCropOverlay = () => {
  const [selectedFrameSection, setSelectedFrameSection] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cropSize = useEditorStore((s) => s.cropSize);
  const setCropSize = useEditorStore((s) => s.setCropSize);
  const imageBounds = useEditorStore((s) => s.imageBounds);
  const accumulatedPan = useEditorStore((s) => s.accumulatedPan);
  const setAccumulatedPan = useEditorStore((s) => s.setAccumulatedPan);
  const { gridOverlayColor, coverMarker, overlayCropColor } = useEditorStore(
    (s) => s.editorOptions
  );

  const { fixedAspectRatio, minimumCropDimensions, dynamicCrop } =
    useContext(EditorContext);
  const [animatedCropSize] = useState({
    width: new Animated.Value(cropSize.width),
    height: new Animated.Value(cropSize.height),
  });

  useEffect(() => {
    checkCropBounds({
      translationX: 0,
      translationY: 0,
    });
    animatedCropSize.height.setValue(cropSize.height);
    animatedCropSize.width.setValue(cropSize.width);
  }, [cropSize]);

  useEffect(() => {
    const newSize = { width: 0, height: 0 };
    const { width, height } = imageBounds;

    if (dynamicCrop) {
      // For dynamic crop, start with a reasonable default size (80% of smaller dimension)
      const smallerDimension = Math.min(width, height);
      newSize.width = smallerDimension * 0.8;
      newSize.height = smallerDimension * 0.8;
    } else {
      // Original fixed aspect ratio logic
      const imageAspectRatio = width / height;
      if (fixedAspectRatio < imageAspectRatio) {
        newSize.height = height * 0.8;
        newSize.width = newSize.height * fixedAspectRatio;
      } else {
        newSize.width = width * 0.8;
        newSize.height = newSize.width / fixedAspectRatio;
      }
    }

    setCropSize(newSize);

    // Center the crop area within the image bounds
    const centeredX = imageBounds.x + (imageBounds.width - newSize.width) / 2;
    const centeredY = imageBounds.y + (imageBounds.height - newSize.height) / 2;

    setAccumulatedPan({
      x: centeredX,
      y: centeredY,
    });
  }, [imageBounds, dynamicCrop]);

  const isMovingSection = () =>
    selectedFrameSection === "topmiddle" ||
    selectedFrameSection === "middleleft" ||
    selectedFrameSection === "middleright" ||
    selectedFrameSection === "middlemiddle" ||
    selectedFrameSection === "bottommiddle";

  const isLeft = selectedFrameSection.endsWith("left");
  const isRight = selectedFrameSection.endsWith("right");
  const isTop = selectedFrameSection.startsWith("top");
  const isBottom = selectedFrameSection.startsWith("bottom");

  const onOverlayMove = ({ nativeEvent }: GestureHandlerEventPayloadType) => {
    if (selectedFrameSection !== "") {
      if (isMovingSection()) {
        setDragOffset({
          x: nativeEvent.translationX,
          y: nativeEvent.translationY,
        });
      } else {
        const { x, y } = getTargetCropFrameBounds(nativeEvent);

        animatedCropSize.width.setValue(cropSize.width + x);
        animatedCropSize.height.setValue(cropSize.height + y);
      }
    } else {
      const { x, y } = nativeEvent;
      const { width: initialWidth, height: initialHeight } = cropSize;
      let position = "";

      if (y / initialHeight < 0.333) {
        position = position + "top";
      } else if (y / initialHeight < 0.667) {
        position = position + "middle";
      } else {
        position = position + "bottom";
      }

      if (x / initialWidth < 0.333) {
        position = position + "left";
      } else if (x / initialWidth < 0.667) {
        position = position + "middle";
      } else {
        position = position + "right";
      }

      setSelectedFrameSection(position);
    }
  };

  type Translate = {
    translationX: number;
    translationY: number;
  };

  const getTargetCropFrameBounds = ({
    translationX,
    translationY,
  }: Translate) => {
    let x = 0;
    let y = 0;

    if (dynamicCrop) {
      // For dynamic crop, allow independent width and height adjustment
      if (isLeft || isRight) {
        x = (isLeft ? -1 : 1) * translationX;
      }
      if (isTop || isBottom) {
        y = (isTop ? -1 : 1) * translationY;
      }

      // For corner handles, allow both directions
      if ((isLeft || isRight) && (isTop || isBottom)) {
        x = (isLeft ? -1 : 1) * translationX;
        y = (isTop ? -1 : 1) * translationY;
      }
    } else {
      // Original fixed aspect ratio logic
      if (translationX && translationY) {
        if (Math.abs(translationX) < Math.abs(translationY)) {
          x = (isLeft ? -1 : 1) * translationX;
          y = x / fixedAspectRatio;
        } else {
          y = (isTop ? -1 : 1) * translationY;
          x = y * fixedAspectRatio;
        }
      }
    }

    return { x, y };
  };

  const onOverlayRelease = (
    nativeEvent: Readonly<
      HandlerStateChangeEventPayload & PanGestureHandlerEventPayload
    >
  ) => {
    if (isMovingSection()) {
      let newX = accumulatedPan.x + dragOffset.x;
      let newY = accumulatedPan.y + dragOffset.y;

      // Clamp to bounds
      if (newX <= imageBounds.x) {
        newX = imageBounds.x;
      } else if (newX + cropSize.width > imageBounds.width + imageBounds.x) {
        newX = imageBounds.x + imageBounds.width - cropSize.width;
      }
      if (newY <= imageBounds.y) {
        newY = imageBounds.y;
      } else if (newY + cropSize.height > imageBounds.height + imageBounds.y) {
        newY = imageBounds.y + imageBounds.height - cropSize.height;
      }

      setAccumulatedPan({ x: newX, y: newY });
      setDragOffset({ x: 0, y: 0 });
    } else {
      checkResizeBounds(nativeEvent);
    }
    setSelectedFrameSection("");
  };

  const onHandlerStateChange = ({
    nativeEvent,
  }: HandlerStateChangeEventType) => {
    if (nativeEvent.state === State.BEGAN) setIsDragging(true);
    if (nativeEvent.state === State.END) {
      onOverlayRelease(nativeEvent);
      setIsDragging(false);
    }
  };

  const checkCropBounds = ({ translationX, translationY }: Translate) => {
    let accDx = accumulatedPan.x + translationX;

    if (accDx <= imageBounds.x) {
      accDx = imageBounds.x;
    } else if (accDx + cropSize.width > imageBounds.width + imageBounds.x) {
      accDx = imageBounds.x + imageBounds.width - cropSize.width;
    }

    let accDy = accumulatedPan.y + translationY;

    if (accDy <= imageBounds.y) {
      accDy = imageBounds.y;
    } else if (accDy + cropSize.height > imageBounds.height + imageBounds.y) {
      accDy = imageBounds.y + imageBounds.height - cropSize.height;
    }

    setAccumulatedPan({ x: accDx, y: accDy });
  };

  const checkResizeBounds = ({ translationX, translationY }: Translate) => {
    let { width: maxWidth, height: maxHeight } = imageBounds;
    const { width: minWidth, height: minHeight } = minimumCropDimensions;

    if (dynamicCrop) {
      // For dynamic crop, handle width and height independently
      const { x, y } = getTargetCropFrameBounds({ translationX, translationY });

      let finalWidth = cropSize.width + x;
      let finalHeight = cropSize.height + y;

      // Constrain width
      if (finalWidth > maxWidth) {
        finalWidth = maxWidth;
      } else if (finalWidth < minWidth) {
        finalWidth = minWidth;
      }

      // Constrain height
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
      } else if (finalHeight < minHeight) {
        finalHeight = minHeight;
      }

      // Update position if needed (for top/left handles)
      const xOffset = isLeft ? cropSize.width - finalWidth : 0;
      const yOffset = isTop ? cropSize.height - finalHeight : 0;

      setAccumulatedPan({
        x: accumulatedPan.x + xOffset,
        y: accumulatedPan.y + yOffset,
      });

      setCropSize({
        height: finalHeight,
        width: finalWidth,
      });
    } else {
      // Original fixed aspect ratio logic
      const height = maxWidth / fixedAspectRatio;
      if (maxHeight > height) maxHeight = height;

      const width = maxHeight * fixedAspectRatio;
      if (maxWidth > width) maxWidth = width;

      const { x, y } = getTargetCropFrameBounds({ translationX, translationY });
      const animatedWidth = cropSize.width + x;
      const animatedHeight = cropSize.height + y;
      let finalHeight = animatedHeight;
      let finalWidth = animatedWidth;

      if (animatedHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = finalHeight * fixedAspectRatio;
      } else if (animatedHeight < minHeight) {
        finalHeight = minHeight;
        finalWidth = finalHeight * fixedAspectRatio;
      }

      if (animatedWidth > maxWidth) {
        finalWidth = maxWidth;
        finalHeight = maxHeight;
      } else if (animatedWidth < minWidth) {
        finalWidth = minWidth;
        finalHeight = finalWidth / fixedAspectRatio;
      }

      setAccumulatedPan({
        x: accumulatedPan.x + (isLeft ? -x : 0),
        y: accumulatedPan.y + (isTop ? -y : 0),
      });

      setCropSize({
        height: finalHeight,
        width: finalWidth,
      });
    }
  };

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
          onGestureEvent={onOverlayMove}
          onHandlerStateChange={(e) => onHandlerStateChange(e)}
        >
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: overlayCropColor,
                borderColor: gridOverlayColor,
              },
              animatedCropSize,
              {
                transform: [
                  { translateX: accumulatedPan.x + dragOffset.x },
                  { translateY: accumulatedPan.y + dragOffset.y },
                ],
              },
            ]}
          >
            {horizontalSections.map((horizontalSection) => {
              return (
                <View style={styles.sectionRow} key={horizontalSection}>
                  {verticalSections.map((verticalSection) => {
                    const key = horizontalSection + verticalSection;
                    return (
                      <View
                        style={[
                          styles.defaultSection,
                          { borderColor: gridOverlayColor },
                        ]}
                        key={key}
                      >
                        {key === "topleft" ||
                        key === "topright" ||
                        key === "bottomleft" ||
                        key === "bottomright"
                          ? coverMarker?.show && (
                              <View
                                style={[
                                  styles.cornerMarker,
                                  { borderColor: coverMarker?.color },
                                  horizontalSection === "top"
                                    ? { top: -4, borderTopWidth: 7 }
                                    : { bottom: -4, borderBottomWidth: 7 },
                                  verticalSection === "left"
                                    ? { left: -4, borderLeftWidth: 7 }
                                    : { right: -4, borderRightWidth: 7 },
                                ]}
                              />
                            )
                          : null}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </View>
  );
};

export { ImageCropOverlay };

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  overlay: {
    height: 40,
    width: 40,
    borderWidth: 1,
  },
  sectionRow: {
    flexDirection: "row",
    flex: 1,
  },
  defaultSection: {
    flex: 1,
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  cornerMarker: {
    position: "absolute",
    height: 30,
    width: 30,
  },
});
