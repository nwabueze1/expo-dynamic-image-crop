import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FeatherIconNames, MaterialIconNames } from "../types";

type IconProps = {
  color: string;
  text: string;
  iconID: MaterialIconNames | FeatherIconNames;
};

export function Icon({ text, iconID, color }: IconProps) {
  return (
    <View style={styles.container}>
      {iconID === "x" ? (
        <Feather
          name={iconID}
          size={26}
          color={color}
        />
      ) : (
        <MaterialIcons
          name={iconID as MaterialIconNames}
          size={26}
          color={color}
        />
      )}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    width: 80,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  text: {
    color: "#fff",
    textAlign: "center",
  },
});
