import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { FeatherIconNames, MaterialIconNames } from "../types";
import { Icon } from "./Icon";

type IconButtonProps = {
  color: string;
  text: string;
  iconID: MaterialIconNames | FeatherIconNames;
} & TouchableOpacityProps;

export function IconButton({ text, iconID, color, ...buttonProps }: IconButtonProps) {
  return (
    <TouchableOpacity {...buttonProps}>
      <Icon
        text={text}
        iconID={iconID}
        color={color}
      />
    </TouchableOpacity>
  );
}
