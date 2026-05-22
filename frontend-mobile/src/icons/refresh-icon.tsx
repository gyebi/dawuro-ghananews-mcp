import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type RefreshIconProps = {
  color?: string;
  size?: number;
};

export function RefreshIcon({ color = "#006B3F", size = 24 }: RefreshIconProps) {
  return <MaterialIcons name="refresh" size={size} color={color} />;
}
