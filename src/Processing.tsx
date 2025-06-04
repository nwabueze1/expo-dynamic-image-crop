import { ComponentProps, ReactNode } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

type Props = {
  color?: string;
  size?: ComponentProps<typeof ActivityIndicator>["size"];
  customComponent?: ReactNode;
};

function Processing({ color = "#FFF", size = "large", customComponent }: Props) {
  return (
    <View style={styles.container}>
      {customComponent ?? (
        <ActivityIndicator
          color={color}
          size={size}
        />
      )}
    </View>
  );
}

export { Processing };

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "#33333355",
    justifyContent: "center",
    alignItems: "center",
  },
});
