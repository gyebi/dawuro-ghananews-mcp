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
import {
  isMcpBridgeConfigured,
  summarizeNewsArticle,
  type ArticleSummary,
} from "@/lib/mcp";
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
  const [aiSummary, setAiSummary] = useState<ArticleSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

        {isMcpBridgeConfigured() ? (
          <View style={styles.aiSection}>
            <Pressable
              style={styles.aiButton}
              onPress={handleSummarizeStory}
              disabled={aiLoading}
            >
              <Text style={styles.aiButtonText}>
                {aiLoading ? "Summarizing..." : "Summarize"}
              </Text>
            </Pressable>

            {aiSummary ? (
              <View style={styles.aiSummary}>
                <Text style={styles.aiSummaryTitle}>Dawuro Summary</Text>
                <Text style={styles.aiSummaryText}>{aiSummary.summary}</Text>
                {aiSummary.keyPoints.map((point) => (
                  <Text key={point} style={styles.aiPoint}>
                    {point}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

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


  async function handleSummarizeStory() {
    if (!id || aiLoading) return;

    try {
      setAiLoading(true);
      const summary = await summarizeNewsArticle(id, "short");
      setAiSummary(summary);
    } catch (error) {
      console.log("MCP summarize error:", error);
      alert("Could not summarize story.");
    } finally {
      setAiLoading(false);
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  loading: {
    padding: 22,
    color: Colors.textSoft,
    fontSize: 16,
  },
  category: {
    color: Colors.brand.red,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: Colors.textStrong,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    marginBottom: 12,
  },
  source: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 18,
    textTransform: "uppercase",
  },
  summary: {
    color: Colors.body,
    fontSize: 17,
    lineHeight: 27,
  },
  button: {
    backgroundColor: Colors.textStrong,
    padding: 15,
    borderRadius: 8,
    marginTop: 18,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "900",
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: Colors.brand.gold,
    padding: 15,
    borderRadius: 8,
    marginTop: 22,
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
    padding: 12,
    borderRadius: 8,
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
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  aiSection: {
    marginTop: 12,
  },
  aiButton: {
    alignItems: "center",
    backgroundColor: Colors.brand.green,
    borderRadius: 8,
    padding: 15,
  },
  aiButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  aiSummary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderCool,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  aiSummaryTitle: {
    color: Colors.textStrong,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  aiSummaryText: {
    color: Colors.body,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 8,
  },
  aiPoint: {
    color: Colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },

});
