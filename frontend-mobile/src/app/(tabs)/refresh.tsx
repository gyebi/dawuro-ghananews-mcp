import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import {
  createMorningBriefing,
  getPersonalizedNewsBriefing,
  getTrackedNewsTopics,
  getNewsTrendingTopics,
  isMcpBridgeConfigured,
  removeTrackedNewsTopic,
  trackNewsTopic,
  type MorningBriefing,
  type PersonalizedBriefing,
  type TrackedTopic,
  type TrendingTopic,
} from "@/lib/mcp";

export default function RefreshScreen() {
  const [topicInput, setTopicInput] = useState("");
  const [trackedTopics, setTrackedTopics] = useState<TrackedTopic[] | null>(null);
  const [personalizedBriefing, setPersonalizedBriefing] =
    useState<PersonalizedBriefing | null>(null);
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const bridgeReady = isMcpBridgeConfigured();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Dawuro AI</Text>
          <Text style={styles.title}>Briefing Desk</Text>
          <Text style={styles.subtitle}>
            Generate a quick view of current stories and moving topics.
          </Text>
        </View>

        {!bridgeReady ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>MCP bridge not configured</Text>
            <Text style={styles.noticeText}>
              Add EXPO_PUBLIC_MCP_BRIDGE_URL to enable AI briefing tools.
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.topicTracker}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Tracked Topics</Text>
                <Pressable onPress={loadTrackedTopics} disabled={Boolean(loading)}>
                  <Text style={styles.inlineActionText}>
                    {loading === "topics" ? "..." : "Load"}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.topicInputRow}>
                <TextInput
                  value={topicInput}
                  onChangeText={setTopicInput}
                  placeholder="Track cedi, cocoa prices, SHS..."
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={handleTrackTopic}
                  style={styles.topicInput}
                />
                <Pressable
                  style={styles.trackButton}
                  onPress={handleTrackTopic}
                  disabled={Boolean(loading)}
                >
                  <Text style={styles.trackButtonText}>
                    {loading === "track" ? "..." : "Track"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.actionButton}
                onPress={loadMorningBriefing}
                disabled={Boolean(loading)}
              >
                <Text style={styles.actionButtonText}>Morning Briefing</Text>
              </Pressable>
              <Pressable
                style={styles.actionButtonSecondary}
                onPress={loadPersonalizedBriefing}
                disabled={Boolean(loading)}
              >
                <Text style={styles.actionButtonSecondaryText}>For You</Text>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.actionButtonSecondary}
                onPress={loadTrendingTopics}
                disabled={Boolean(loading)}
              >
                <Text style={styles.actionButtonSecondaryText}>Trending Topics</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? <ActivityIndicator style={styles.loader} /> : null}

        {trackedTopics ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Tracked Topics</Text>
              <Text style={styles.panelMeta}>{trackedTopics.length} topics</Text>
            </View>
            {trackedTopics.length ? (
              <View style={styles.trackedTopicList}>
                {trackedTopics.map((topic) => (
                  <View key={topic.id} style={styles.trackedTopicRow}>
                    <Text style={styles.trackedTopicName}>
                      {topic.displayTopic || topic.topic}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveTrackedTopic(topic.id)}
                      disabled={Boolean(loading)}
                    >
                      <Text style={styles.removeTopicText}>
                        {loading === topic.id ? "..." : "Remove"}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyPanelText}>No tracked topics yet.</Text>
            )}
          </View>
        ) : null}

        {briefing ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{briefing.title}</Text>
              <Text style={styles.panelMeta}>{briefing.totalStories} stories</Text>
            </View>
            {briefing.sections.map((section) => (
              <View key={section.category} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.category}</Text>
                {section.stories.map((story) => (
                  <View key={`${section.category}-${story.title}`} style={styles.storyRow}>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    <Text style={styles.storySummary} numberOfLines={2}>
                      {story.summary}
                    </Text>
                    <Text style={styles.storySource}>{story.source}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {personalizedBriefing ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>For You</Text>
              <Text style={styles.panelMeta}>
                {personalizedBriefing.trackedTopicCount} tracked
              </Text>
            </View>
            {personalizedBriefing.message ? (
              <Text style={styles.emptyPanelText}>{personalizedBriefing.message}</Text>
            ) : null}
            {personalizedBriefing.sections.map((section) => (
              <View key={section.topicId || section.topic} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {section.topic}
                  {typeof section.storyCount === "number"
                    ? ` · ${section.storyCount} stories`
                    : ""}
                </Text>
                {section.stories.map((story) => (
                  <View key={`${section.topic}-${story.title}`} style={styles.storyRow}>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    <Text style={styles.storySummary} numberOfLines={2}>
                      {story.summary}
                    </Text>
                    <Text style={styles.storySource}>{story.source}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {trendingTopics ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Trending Topics</Text>
              <Text style={styles.panelMeta}>{trendingTopics.length} topics</Text>
            </View>
            <View style={styles.topicGrid}>
              {trendingTopics.map((topic) => (
                <View key={topic.topic} style={styles.topicCard}>
                  <Text style={styles.topicName}>{topic.topic}</Text>
                  <Text style={styles.topicMeta}>
                    {topic.score} mentions · {topic.sourceCount} sources
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );

  async function loadMorningBriefing() {
    try {
      setLoading("briefing");
      setBriefing(await createMorningBriefing());
    } catch (error) {
      console.log("Morning briefing error:", error);
      alert(getErrorMessage(error, "Could not create morning briefing."));
    } finally {
      setLoading(null);
    }
  }

  async function loadTrendingTopics() {
    try {
      setLoading("trending");
      setTrendingTopics(await getNewsTrendingTopics());
    } catch (error) {
      console.log("Trending topics error:", error);
      alert(getErrorMessage(error, "Could not load trending topics."));
    } finally {
      setLoading(null);
    }
  }

  async function loadPersonalizedBriefing() {
    try {
      setLoading("personalized");
      setPersonalizedBriefing(await getPersonalizedNewsBriefing());
    } catch (error) {
      console.log("Personalized briefing error:", error);
      alert(getErrorMessage(error, "Could not create personalized briefing."));
    } finally {
      setLoading(null);
    }
  }

  async function loadTrackedTopics() {
    try {
      setLoading("topics");
      setTrackedTopics(await getTrackedNewsTopics());
    } catch (error) {
      console.log("Tracked topics error:", error);
      alert(getErrorMessage(error, "Could not load tracked topics."));
    } finally {
      setLoading(null);
    }
  }

  async function handleTrackTopic() {
    const topic = topicInput.trim();

    if (!topic || loading) return;

    try {
      setLoading("track");
      await trackNewsTopic(topic);
      setTopicInput("");
      setTrackedTopics(await getTrackedNewsTopics());
    } catch (error) {
      console.log("Track topic error:", error);
      alert(getErrorMessage(error, "Could not track topic."));
    } finally {
      setLoading(null);
    }
  }

  async function handleRemoveTrackedTopic(topicId: string) {
    if (loading) return;

    try {
      setLoading(topicId);
      await removeTrackedNewsTopic(topicId);
      setTrackedTopics((topics) =>
        topics ? topics.filter((topic) => topic.id !== topicId) : topics
      );
    } catch (error) {
      console.log("Remove tracked topic error:", error);
      alert(getErrorMessage(error, "Could not remove tracked topic."));
    } finally {
      setLoading(null);
    }
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 14,
  },
  eyebrow: {
    color: Colors.brand.green,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.textStrong,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  notice: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  noticeTitle: {
    color: Colors.textStrong,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  noticeText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  topicTracker: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  topicInputRow: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 4,
  },
  topicInput: {
    color: Colors.text,
    flex: 1,
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  trackButton: {
    alignItems: "center",
    backgroundColor: Colors.brand.green,
    borderRadius: 7,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 70,
  },
  trackButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  inlineActionText: {
    color: Colors.brand.green,
    fontSize: 12,
    fontWeight: "900",
    paddingLeft: 10,
    textTransform: "uppercase",
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: Colors.brand.green,
    borderRadius: 8,
    flex: 1,
    padding: 14,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  actionButtonSecondary: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  actionButtonSecondaryText: {
    color: Colors.textStrong,
    fontSize: 14,
    fontWeight: "900",
  },
  loader: {
    marginVertical: 18,
  },
  panel: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  panelHeader: {
    alignItems: "center",
    borderBottomColor: Colors.borderMuted,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  panelTitle: {
    color: Colors.textStrong,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
  panelMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyPanelText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 12,
  },
  trackedTopicList: {
    paddingTop: 10,
  },
  trackedTopicRow: {
    alignItems: "center",
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 46,
    gap: 12,
  },
  trackedTopicName: {
    color: Colors.textStrong,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  removeTopicText: {
    color: Colors.brand.red,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  section: {
    paddingTop: 12,
  },
  sectionTitle: {
    color: Colors.brand.red,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  storyRow: {
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  storyTitle: {
    color: Colors.textStrong,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },
  storySummary: {
    color: Colors.summary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  storySource: {
    color: Colors.brand.green,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6,
    textTransform: "uppercase",
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 12,
  },
  topicCard: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    width: "48%",
  },
  topicName: {
    color: Colors.textStrong,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  topicMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
});
