import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/colors";

type BackIconProps = {
  color?: string;
  size?: number;
};

export function BackIcon({ color = Colors.brand.green, size = 26 }: BackIconProps) {
  return <MaterialIcons name="arrow-back-ios-new" size={size} color={color} />;
}
