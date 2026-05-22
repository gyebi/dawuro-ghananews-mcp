import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/colors";

type RefreshIconProps = {
  color?: string;
  size?: number;
};

export function RefreshIcon({ color = Colors.brand.green, size = 24 }: RefreshIconProps) {
  return <MaterialIcons name="refresh" size={size} color={color} />;
}
