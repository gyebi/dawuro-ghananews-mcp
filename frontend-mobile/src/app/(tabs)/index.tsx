import React, { useCallback, useEffect, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { getStories, newsAgencies, type NewsAgency, type Story } from "@/lib/stories";

const quickTopics = ["All", "Politics", "Business", "Sports", "Education", "Health", "Entertainment"];
const searchableStoryFields = ["title", "summary", "category", "source"] as const;

function getStoryDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  return null;
}

function getStoryDateLabel(story: Story) {
  const date = getStoryDate(story.publishedAt) ?? getStoryDate(story.createdAt);

  if (!date) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomeScreen() {
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<NewsAgency>("All");
  const [loading, setLoading] = useState(false);

  const loadStories = useCallback(async (source: NewsAgency) => {
    try {
      setLoading(true);
      const data = await getStories(source);
      setAllStories(data);
      setStories(data);
    } catch (error) {
      console.log("Failed to load stories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  function searchNews() {
    filterStories(query);
  }

  function filterStories(filter: string) {
    const filterTerm = filter.trim().toLowerCase();

    if (!filterTerm || filterTerm === "all") {
      setStories(allStories);
      return;
    }

    setStories(
      allStories.filter((story) =>
        searchableStoryFields.some((field) =>
          story[field]?.toLowerCase().includes(filterTerm)
        )
      )
    );
  }

  function searchTopic(topic: string) {
    setQuery(topic === "All" ? "" : topic);
    filterStories(topic);
  }

  function filterByAgency(source: NewsAgency) {
    setSelectedAgency(source);
    setQuery("");
  }

  useEffect(() => {
    loadStories(selectedAgency);
  }, [loadStories, refresh, selectedAgency]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require("../../../assets/images/dawuro-logo.png")}
            style={styles.logoImage}
          />
          <View>
            <Text style={styles.logo}>Dawuro</Text>
            <View style={styles.subtitleRow}>
              <Image
                source={require("../../../assets/images/ghana-wordmark.png")}
                style={styles.ghanaWordmark}
              />
              <Text style={styles.subtitle}> news, announced.</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Text>
          <Text style={styles.storyCount}>{stories.length} stories</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Ghana news"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            onSubmitEditing={searchNews}
            returnKeyType="search"
          />
          <Pressable style={styles.searchButton} onPress={searchNews}>
            <Text style={styles.searchButtonText}>Go</Text>
          </Pressable>
        </View>

        <View style={styles.topicSection}>
          <Text style={styles.topicTitle}>News Agencies</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topics}
          >
            {newsAgencies.map((agency) => (
              <Pressable
                key={agency}
                style={[
                  styles.topicChip,
                  selectedAgency === agency && styles.selectedTopicChip,
                ]}
                onPress={() => filterByAgency(agency)}
              >
                <View style={styles.topicChipGloss} />
                <Text
                  style={[
                    styles.topicChipText,
                    selectedAgency === agency && styles.selectedTopicChipText,
                  ]}
                >
                  {agency}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.topicTitle}>Quick Topics</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topics}
          >
            {quickTopics.map((topic) => (
              <Pressable
                key={topic}
                style={styles.topicChip}
                onPress={() => searchTopic(topic)}
              >
                <View style={styles.topicChipGloss} />
                <Text style={styles.topicChipText}>{topic}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Stories</Text>
        <Text style={styles.sectionMeta}>{selectedAgency}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={stories}
          refreshing={loading}
          onRefresh={() => loadStories(selectedAgency)}
          keyExtractor={(item, index) => item.id || `${item.url}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const storyDate = getStoryDateLabel(item);
            const cardContent = (
              <>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.category}>{item.category ?? "News"}</Text>
                  {storyDate ? <Text style={styles.storyDate}>{storyDate}</Text> : null}
                </View>
                <Text style={styles.title} numberOfLines={3}>
                  {item.title}
                </Text>
                <Text style={styles.summary} numberOfLines={2}>
                  {item.summary ?? item.title}
                </Text>
                <View style={styles.sourceRow}>
                  <Text style={styles.source}>{item.source}</Text>
                </View>
              </>
            );

            if (item.id) {
              return (
                <Link
                  href={{
                    pathname: "/story/[id]",
                    params: { id: item.id },
                  }}
                  asChild
                >
                  <Pressable style={styles.card}>{cardContent}</Pressable>
                </Link>
              );
            }

            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/story",
                    params: {
                      title: item.title,
                      url: item.url ?? "",
                      source: item.source,
                    },
                  })
                }
              >
                {cardContent}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    paddingTop: 8,
    gap: 12,
  },
  date: {
    color: Colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  logo: {
    color: Colors.textStrong,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textMuted,
  },
  subtitleRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginTop: 4,
  },
  ghanaWordmark: {
    height: 15,
    width: 52,
    marginBottom: 1,
    resizeMode: "contain",
  },
  headerMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  storyCount: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderMuted,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.textStrong,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    minHeight: 40,
    fontSize: 15,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.brand.green,
    borderRadius: 7,
    minHeight: 40,
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: Colors.white,
    fontWeight: "800",
  },
  controls: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textStrong,
  },
  sectionMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingBottom: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSource: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.brand.red,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 24,
  },
  cardLink: {
    marginTop: 12,
    color: Colors.brand.green,
    fontWeight: "700",
  },
  category: {
    color: Colors.brand.red,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  cardMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 7,
  },
  storyDate: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: Colors.textStrong,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  summary: {
    color: Colors.summary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  sourceRow: {
    alignItems: "flex-start",
    marginTop: 9,
  },
  source: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 6,
    color: Colors.brand.green,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: 30,
    textAlign: "center",
  },

  topicSection: {
    marginTop: 10,
  },
  topicTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.textMuted,
    marginBottom: 7,
    marginTop: 6,
    textTransform: "uppercase",
  },
  topics: {
    flexDirection: "row",
    gap: 7,
    paddingRight: 2,
  },
  topicChip: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    minHeight: 30,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
  },
  topicChipGloss: {
    display: "none",
  },
  topicChipText: {
    color: Colors.text,
    fontWeight: "800",
    fontSize: 12,
  },
  selectedTopicChip: {
    backgroundColor: Colors.brand.green,
    borderColor: Colors.brand.green,
  },
  selectedTopicChipText: {
    color: Colors.white,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "contain",
  },
});
