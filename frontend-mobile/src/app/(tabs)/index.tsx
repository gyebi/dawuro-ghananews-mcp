import React, { useEffect, useState } from "react";
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
import { getStories, type Story } from "@/lib/stories";

const quickTopics = ["All", "Politics", "Business", "Sports", "Education", "Health", "Entertainment"];
const searchableStoryFields = ["title", "summary", "category", "source"] as const;

export default function HomeScreen() {
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStories() {
    try {
      setLoading(true);
      const data = await getStories();
      setAllStories(data);
      setStories(data);
    } catch (error) {
      console.log("Failed to load stories:", error);
    } finally {
      setLoading(false);
    }
  }

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

  useEffect(() => {
    loadStories();
  }, [refresh]);

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
          onRefresh={loadStories}
          keyExtractor={(item, index) => item.id || `${item.url}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cardContent = (
              <>
                <Text style={styles.category}>{item.category ?? "News"}</Text>
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
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
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
