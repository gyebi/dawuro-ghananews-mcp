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
import { Colors } from "@/constants/colors";

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
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: Colors.brand.green,
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  source: {
    color: Colors.brand.red,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 34,
  },
  readButton: {
    backgroundColor: Colors.brand.green,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 2,
    borderColor: Colors.brand.gold,
  },
  saveButton: {
    backgroundColor: Colors.brand.gold,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  shareSection: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  shareTitle: {
    color: Colors.textMuted,
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
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  readButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
});
