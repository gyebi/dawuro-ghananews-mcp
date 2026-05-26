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
      <Text style={styles.date}>
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </Text>

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

      <Text style={styles.sectionTitle}>Latest Stories</Text>

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
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.summary}>{item.summary ?? item.title}</Text>
                <Text style={styles.source}>{item.source}</Text>
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
    paddingHorizontal: 18,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  date: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  subtitleRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginTop: 4,
  },
  ghanaWordmark: {
    height: 19,
    width: 64,
    marginBottom: 1,
    resizeMode: "contain",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.borderMuted,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    minHeight: 42,
    fontSize: 15,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.brand.green,
    borderRadius: 10,
    minHeight: 42,
    minWidth: 54,
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
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cardMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  storyDate: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  summary: {
    color: Colors.summary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  source: {
    color: Colors.brand.green,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: 30,
    textAlign: "center",
  },

  topicSection: {
    marginTop: 12,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 6,
    textTransform: "uppercase",
  },
  topics: {
    flexDirection: "row",
    gap: 7,
    paddingRight: 2,
  },
  topicChip: {
    backgroundColor: Colors.brand.gold,
    borderRadius: 999,
    minHeight: 28,
    overflow: "hidden",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: Colors.topicGoldBorder,
  },
  topicChipGloss: {
    backgroundColor: "rgba(255, 255, 255, 0.38)",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    height: "48%",
    left: 1,
    position: "absolute",
    right: 1,
    top: 1,
  },
  topicChipText: {
    color: Colors.text,
    fontWeight: "700",
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
    gap: 12,
  },
  logoImage: {
    width: 109,
    height: 109,
    borderRadius: 18,
    resizeMode: "contain",
  },
});
