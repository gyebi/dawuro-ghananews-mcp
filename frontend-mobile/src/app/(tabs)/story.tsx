import React from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { saveStoryForLater } from "@/lib/stories";
import { FacebookIcon } from "@/icons/facebook-icon";
import { InstagramIcon } from "@/icons/instagram-icon";
import { WhatsappIcon } from "@/icons/whatsapp-icon";
import { XIcon } from "@/icons/x-icon";

export default function StoryScreen() {
  const params = useLocalSearchParams();

  const title = String(params.title || "");
  const source = String(params.source || "");
  const url = String(params.url || "");

  async function handleSaveStory() {
    try {
      await saveStoryForLater({
        title,
        summary: title,
        source,
        category: "News",
        url,
      });
      alert("Story saved!");
    } catch (error) {
      console.log("Save story error:", error);
      alert("Could not save story.");
    }
  }

  async function handleShareStory() {
    try {
      await Share.share({
        message: `${title}\n\nRead more: ${url || "Dawuro"}`,
      });
    } catch (error) {
      console.log("Share story error:", error);
      alert("Could not share story.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.source}>{source.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>

        <Pressable style={styles.saveButton} onPress={handleSaveStory}>
          <Text style={styles.saveButtonText}>Save Story</Text>
        </Pressable>

        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Share story</Text>
          <View style={styles.shareIcons}>
            <Pressable style={styles.shareIconButton} onPress={handleShareStory}>
              <FacebookIcon />
            </Pressable>
            <Pressable style={styles.shareIconButton} onPress={handleShareStory}>
              <WhatsappIcon />
            </Pressable>
            <Pressable style={styles.shareIconButton} onPress={handleShareStory}>
              <XIcon />
            </Pressable>
            <Pressable style={styles.shareIconButton} onPress={handleShareStory}>
              <InstagramIcon />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.readButton}
          onPress={() => {
            if (url) {
              Linking.openURL(url);
            }
          }}
        >
          <Text style={styles.readButtonText}>Read Full Story</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "#006B3F",
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  source: {
    color: "#CE1126",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 12,
  },
  title: {
    color: "#111827",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 34,
  },
  readButton: {
    backgroundColor: "#006B3F",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 2,
    borderColor: "#FCD116",
  },
  saveButton: {
    backgroundColor: "#FCD116",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  shareSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  shareTitle: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  shareIcons: {
    flexDirection: "row",
    gap: 10,
  },
  shareIconButton: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  readButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
