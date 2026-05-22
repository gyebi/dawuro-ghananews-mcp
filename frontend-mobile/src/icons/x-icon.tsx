import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type SocialIconProps = {
  color?: string;
  size?: number;
};

export function XIcon({ color = "#0F172A", size = 22 }: SocialIconProps) {
  return <FontAwesome6 name="x-twitter" size={size} color={color} />;
}
