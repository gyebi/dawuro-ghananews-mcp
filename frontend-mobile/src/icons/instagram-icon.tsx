import FontAwesome from "@expo/vector-icons/FontAwesome";

type SocialIconProps = {
  color?: string;
  size?: number;
};

export function InstagramIcon({ color = "#E4405F", size = 24 }: SocialIconProps) {
  return <FontAwesome name="instagram" size={size} color={color} />;
}
