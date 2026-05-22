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
import { getStories, type Story } from "@/lib/stories";

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
    if (!query.trim()) {
      setStories(allStories);
      return;
    }

    const searchTerm = query.trim().toLowerCase();

    setStories(
      allStories.filter((story) => {
        return [
          story.title,
          story.summary,
          story.category,
          story.source,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm));
      })
    );
  }

  function searchTopic(topic: string) {
    setQuery(topic);
    const topicLower = topic.toLowerCase();

    setStories(
      allStories.filter((story) =>
        [story.title, story.summary, story.category, story.source]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(topicLower))
      )
    );
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
            <Text style={styles.subtitle}>Ghana news, announced.</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Ghana news"
            placeholderTextColor="#9CA3AF"
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
            {["Politics", "Business", "Sports", "Education", "Health", "Entertainment"].map(
              (topic) => (
                <Pressable
                  key={topic}
                  style={styles.topicChip}
                  onPress={() => searchTopic(topic)}
                >
                  <Text style={styles.topicChipText}>{topic}</Text>
                </Pressable>
              )
            )}
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
    backgroundColor: "#FFFDF7",
    paddingHorizontal: 18,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  date: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: "#E6E8EC",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    minHeight: 42,
    fontSize: 15,
    color: "#111827",
  },
  searchButton: {
    backgroundColor: "#006B3F",
    borderRadius: 10,
    minHeight: 42,
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  controls: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardSource: {
    fontSize: 12,
    fontWeight: "800",
    color: "#CE1126",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },
  cardLink: {
    marginTop: 12,
    color: "#006B3F",
    fontWeight: "700",
  },
  category: {
    color: "#CE1126",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  summary: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  source: {
    color: "#006B3F",
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 30,
    textAlign: "center",
  },

  topicSection: {
    marginTop: 12,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  topics: {
    flexDirection: "row",
    gap: 7,
    paddingRight: 2,
  },
  topicChip: {
    backgroundColor: "#FFF8D8",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F3D36B",
  },
  topicChipText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 84,
    height: 84,
    borderRadius: 18,
    resizeMode: "contain",
  },
});
