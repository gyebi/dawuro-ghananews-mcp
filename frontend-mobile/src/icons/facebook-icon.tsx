import FontAwesome from "@expo/vector-icons/FontAwesome";

type SocialIconProps = {
  color?: string;
  size?: number;
};

export function FacebookIcon({ color = "#1877F2", size = 24 }: SocialIconProps) {
  return <FontAwesome name="facebook" size={size} color={color} />;
}
