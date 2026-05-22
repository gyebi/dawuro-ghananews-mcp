import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getStoryById, saveStoryForLater, type Story } from "@/lib/stories";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { FacebookIcon } from "@/icons/facebook-icon";
import { InstagramIcon } from "@/icons/instagram-icon";
import { WhatsappIcon } from "@/icons/whatsapp-icon";
import { XIcon } from "@/icons/x-icon";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStory() {
      if (!id) return;

      try {
        const data = await getStoryById(id);
        setStory(data);
      } catch (error) {
        console.log("Story detail error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStory();
  }, [id]);

  if (loading) {
    return (
      <ScrollView style={styles.page}>
        <Text style={styles.loading}>Loading story...</Text>
      </ScrollView>
    );
  }

  if (!story) {
    return (
      <ScrollView style={styles.page}>
        <Text style={styles.title}>Story not found</Text>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.category}>{story.category}</Text>
        <Text style={styles.title}>{story.title}</Text>

        <Text style={styles.source}>{story.source}</Text>

        <Text style={styles.summary}>{story.summary}</Text>

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

        {story.url ? (
          <Pressable style={styles.button} onPress={() => Linking.openURL(story.url!)}>
            <Text style={styles.buttonText}>Read Original Article</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );


  async function handleSaveStory() {
    if (!story) return;

    try {
      await saveStoryForLater(story);
      alert("Story saved!");
    } catch (error) {
      console.log("Save story error:", error);
      alert("Could not save story.");
    }
  }


  async function handleShareStory() {
    if (!story) return;

    try {
      await Share.share({
        message: `${story.title}\n\n${story.summary}\n\nRead more: ${
          story.url || "Dawuro"
        }`,
      });
    } catch (error) {
      console.log("Share story error:", error);
      alert("Could not share story.");
    }
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.surfaceCool,
  },

  safeArea: {
    flex: 1,
    backgroundColor: Colors.surfaceCool,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loading: {
    padding: 22,
    color: Colors.textSoft,
    fontSize: 16,
  },
  category: {
    color: Colors.brand.gold,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    color: Colors.textStrong,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
    marginBottom: 14,
  },
  source: {
    color: Colors.textSoft,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 24,
  },
  summary: {
    color: Colors.body,
    fontSize: 18,
    lineHeight: 29,
  },
  button: {
    backgroundColor: Colors.textStrong,
    padding: 16,
    borderRadius: 16,
    marginTop: 28,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "900",
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: Colors.brand.gold,
    padding: 16,
    borderRadius: 16,
    marginTop: 28,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.textStrong,
    fontWeight: "900",
    fontSize: 15,
  },
  shareSection: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderCool,
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginTop: 12,
  },
  shareTitle: {
    color: Colors.textSoft,
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  shareIcons: {
    flexDirection: "row",
    gap: 10,
  },
  shareIconButton: {
    alignItems: "center",
    backgroundColor: Colors.surfaceCool,
    borderColor: Colors.borderCool,
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

});
