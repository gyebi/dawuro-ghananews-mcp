import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getStories, type Story } from "@/lib/stories";

export default function HomeScreen() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState("all");

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

  function filterBySource(source: string) {
    setSelectedSource(source);

    if (source === "all") {
      setStories(allStories);
      return;
    }

    setStories(
      allStories.filter(
        (story) => story.source.toLowerCase() === source.toLowerCase()
      )
    );
  }

  function searchNews() {
    if (!query.trim()) {
      setStories(
        selectedSource === "all"
          ? allStories
          : allStories.filter(
              (story) =>
                story.source.toLowerCase() === selectedSource.toLowerCase()
            )
      );
      return;
    }

    const searchTerm = query.trim().toLowerCase();

    setStories(
      allStories.filter((story) => {
        const matchesSource =
          selectedSource === "all" ||
          story.source.toLowerCase() === selectedSource.toLowerCase();
        const matchesSearch = [
          story.title,
          story.summary,
          story.category,
          story.source,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm));

        return matchesSource && matchesSearch;
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      
  <View style={styles.header}>
  <View style={styles.logoRow}>
   <Image
      source={require("../../assets/images/dawuro-logo.png")}
      style={styles.logoImage}
    />
  <View>
      <Text style={styles.logo}>Dawuro</Text>
       <Text style={styles.subtitle}>Ghana news, announced.</Text>
    </View>
  </View>
</View>

      <View style={styles.searchBox}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Ghana news..."
          style={styles.searchInput}
          onSubmitEditing={searchNews}
        />
        <Pressable style={styles.searchButton} onPress={searchNews}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <View style={styles.sources}>
        {["all", "citi", "myjoy", "graphic"].map((source) => (
          <Pressable
            key={source}
            onPress={() => filterBySource(source)}
            style={[
              styles.sourceChip,
              selectedSource === source && styles.sourceChipActive,
            ]}
          >
            <Text
              style={[
                styles.sourceChipText,
                selectedSource === source && styles.sourceChipTextActive,
              ]}
            >
              {source.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Latest Stories</Text>

        <View style={styles.topicSection}>
          <Text style={styles.topicTitle}>Quick Topics</Text>

          <View style={styles.topics}>
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
  </View>

        </View>

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
    paddingTop: 30,
    paddingBottom: 18,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: "#006B3F",
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sources: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  sourceChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  sourceChipActive: {
    backgroundColor: "#FCD116",
  },
  sourceChipText: {
    fontWeight: "700",
    color: "#374151",
  },
  sourceChipTextActive: {
    color: "#111827",
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
  marginBottom: 18,
},
topicTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#111827",
  marginBottom: 10,
},
topics: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},
topicChip: {
  backgroundColor: "#FFF7D6",
  borderRadius: 999,
  paddingVertical: 8,
  paddingHorizontal: 13,
  borderWidth: 1,
  borderColor: "#FCD116",
},
topicChipText: {
  color: "#111827",
  fontWeight: "700",
},

logoRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},
logoImage: {
  width: 70,
  height: 70,
  borderRadius: 18,
  resizeMode: "contain",
},
logoIcon: {
  width: 52,
  height: 52,
  borderRadius: 18,
  backgroundColor: "#006B3F",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 3,
  borderColor: "#FCD116",
},
logoIconText: {
  color: "#FFFFFF",
  fontSize: 26,
  fontWeight: "900",
},

});
