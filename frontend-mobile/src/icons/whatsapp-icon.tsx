import FontAwesome from "@expo/vector-icons/FontAwesome";

type SocialIconProps = {
  color?: string;
  size?: number;
};

export function WhatsappIcon({ color = "#25D366", size = 24 }: SocialIconProps) {
  return <FontAwesome name="whatsapp" size={size} color={color} />;
}
