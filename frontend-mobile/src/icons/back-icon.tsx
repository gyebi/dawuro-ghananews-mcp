import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type BackIconProps = {
  color?: string;
  size?: number;
};

export function BackIcon({ color = "#006B3F", size = 26 }: BackIconProps) {
  return <MaterialIcons name="arrow-back-ios-new" size={size} color={color} />;
}
