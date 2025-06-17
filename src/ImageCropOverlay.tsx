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

  const [animatedPosition] = useState({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
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
    // Reset animated position when accumulatedPan changes (after drag ends)
    if (!isDragging) {
      animatedPosition.x.setValue(0);
      animatedPosition.y.setValue(0);
    }
  }, [accumulatedPan, isDragging]);

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

        // Update animated size
        animatedCropSize.width.setValue(cropSize.width + x);
        animatedCropSize.height.setValue(cropSize.height + y);

        // Update animated position for left/top handles
        let positionOffsetX = 0;
        let positionOffsetY = 0;

        if (isLeft) {
          positionOffsetX = -x; // Move opposite to width change
        }
        if (isTop) {
          positionOffsetY = -y; // Move opposite to height change
        }

        animatedPosition.x.setValue(positionOffsetX);
        animatedPosition.y.setValue(positionOffsetY);
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
      // Fixed aspect ratio logic - improved corner handling
      const isCorner = (isLeft || isRight) && (isTop || isBottom);

      if (isCorner) {
        // For corners, use the larger translation to maintain aspect ratio
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);

        if (absX > absY) {
          x = (isLeft ? -1 : 1) * translationX;
          y = x / fixedAspectRatio;
        } else {
          y = (isTop ? -1 : 1) * translationY;
          x = y * fixedAspectRatio;
        }
      } else if (isLeft || isRight) {
        // Side edges
        x = (isLeft ? -1 : 1) * translationX;
        y = x / fixedAspectRatio;
      } else if (isTop || isBottom) {
        // Top/bottom edges
        y = (isTop ? -1 : 1) * translationY;
        x = y * fixedAspectRatio;
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

      // Calculate new dimensions
      let newWidth = cropSize.width + x;
      let newHeight = cropSize.height + y;

      // Calculate new position - account for current animated offset
      let newX = accumulatedPan.x;
      let newY = accumulatedPan.y;

      // For left edges/corners: when width increases, position stays same
      // When width decreases, position moves right by the difference
      if (isLeft) {
        newX = accumulatedPan.x - x; // Move opposite to width change
      }

      // For top edges/corners: when height increases, position stays same
      // When height decreases, position moves down by the difference
      if (isTop) {
        newY = accumulatedPan.y - y; // Move opposite to height change
      }

      // Apply minimum size constraints first
      if (newWidth < minWidth) {
        if (isLeft) {
          // If we're dragging left and hit minimum, adjust position back
          newX = newX + (newWidth - minWidth);
        }
        newWidth = minWidth;
      }

      if (newHeight < minHeight) {
        if (isTop) {
          // If we're dragging top and hit minimum, adjust position back
          newY = newY + (newHeight - minHeight);
        }
        newHeight = minHeight;
      }

      // Apply boundary constraints
      // Left boundary
      if (newX < imageBounds.x) {
        if (isLeft) {
          newWidth = newWidth - (imageBounds.x - newX);
        }
        newX = imageBounds.x;
      }

      // Top boundary
      if (newY < imageBounds.y) {
        if (isTop) {
          newHeight = newHeight - (imageBounds.y - newY);
        }
        newY = imageBounds.y;
      }

      // Right boundary
      if (newX + newWidth > imageBounds.x + imageBounds.width) {
        newWidth = imageBounds.x + imageBounds.width - newX;
      }

      // Bottom boundary
      if (newY + newHeight > imageBounds.y + imageBounds.height) {
        newHeight = imageBounds.y + imageBounds.height - newY;
      }

      // Update state and reset animated values smoothly
      setCropSize({ height: newHeight, width: newWidth });
      setAccumulatedPan({ x: newX, y: newY });
    } else {
      // Fixed aspect ratio logic
      const height = maxWidth / fixedAspectRatio;
      if (maxHeight > height) maxHeight = height;

      const width = maxHeight * fixedAspectRatio;
      if (maxWidth > width) maxWidth = width;

      const { x, y } = getTargetCropFrameBounds({ translationX, translationY });

      let newWidth = cropSize.width + x;
      let newHeight = cropSize.height + y;

      // Maintain aspect ratio
      if (Math.abs(x) > Math.abs(y)) {
        newHeight = newWidth / fixedAspectRatio;
      } else {
        newWidth = newHeight * fixedAspectRatio;
      }

      // Calculate position adjustments
      let newX = accumulatedPan.x;
      let newY = accumulatedPan.y;

      if (isLeft) {
        newX = accumulatedPan.x - (newWidth - cropSize.width);
      }
      if (isTop) {
        newY = accumulatedPan.y - (newHeight - cropSize.height);
      }

      // Apply size constraints
      if (newWidth > maxWidth) {
        const ratio = maxWidth / newWidth;
        newWidth = maxWidth;
        newHeight = newHeight * ratio;

        if (isLeft) {
          newX = accumulatedPan.x - (newWidth - cropSize.width);
        }
        if (isTop) {
          newY = accumulatedPan.y - (newHeight - cropSize.height);
        }
      }

      if (newHeight > maxHeight) {
        const ratio = maxHeight / newHeight;
        newHeight = maxHeight;
        newWidth = newWidth * ratio;

        if (isLeft) {
          newX = accumulatedPan.x - (newWidth - cropSize.width);
        }
        if (isTop) {
          newY = accumulatedPan.y - (newHeight - cropSize.height);
        }
      }

      if (newWidth < minWidth) {
        const ratio = minWidth / newWidth;
        newWidth = minWidth;
        newHeight = newHeight * ratio;

        if (isLeft) {
          newX = accumulatedPan.x - (newWidth - cropSize.width);
        }
        if (isTop) {
          newY = accumulatedPan.y - (newHeight - cropSize.height);
        }
      }

      if (newHeight < minHeight) {
        const ratio = minHeight / newHeight;
        newHeight = minHeight;
        newWidth = newWidth * ratio;

        if (isLeft) {
          newX = accumulatedPan.x - (newWidth - cropSize.width);
        }
        if (isTop) {
          newY = accumulatedPan.y - (newHeight - cropSize.height);
        }
      }

      // Apply boundary constraints
      if (newX < imageBounds.x) {
        const diff = imageBounds.x - newX;
        newX = imageBounds.x;
        if (isLeft) {
          newWidth = newWidth - diff;
          newHeight = newWidth / fixedAspectRatio;
        }
      }

      if (newY < imageBounds.y) {
        const diff = imageBounds.y - newY;
        newY = imageBounds.y;
        if (isTop) {
          newHeight = newHeight - diff;
          newWidth = newHeight * fixedAspectRatio;
        }
      }

      if (newX + newWidth > imageBounds.x + imageBounds.width) {
        newWidth = imageBounds.x + imageBounds.width - newX;
        newHeight = newWidth / fixedAspectRatio;
      }

      if (newY + newHeight > imageBounds.y + imageBounds.height) {
        newHeight = imageBounds.y + imageBounds.height - newY;
        newWidth = newHeight * fixedAspectRatio;
      }

      // Update state and reset animated values smoothly
      setCropSize({ height: newHeight, width: newWidth });
      setAccumulatedPan({ x: newX, y: newY });
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
                  {
                    translateX: Animated.add(
                      accumulatedPan.x + dragOffset.x,
                      animatedPosition.x
                    ),
                  },
                  {
                    translateY: Animated.add(
                      accumulatedPan.y + dragOffset.y,
                      animatedPosition.y
                    ),
                  },
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
                        {(key === "topleft" ||
                          key === "topright" ||
                          key === "bottomleft" ||
                          key === "bottomright") &&
                          coverMarker?.show && (
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
                          )}
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
