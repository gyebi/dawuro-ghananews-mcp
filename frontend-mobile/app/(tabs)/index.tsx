import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE_URL = "http://192.168.254.141:8000";

type Story = {
  title: string;
  url: string;
  source: string;
};

export default function HomeScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState("citi");

  async function fetchSourceNews(source: string) {
    try {
      setLoading(true);
      setSelectedSource(source);

      const response = await fetch(
        `${API_BASE_URL}/news/source/${source}?limit=10`
      );

      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.log("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  }

  async function searchNews() {
    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/news/search?query=${encodeURIComponent(
          query
        )}&limit=10`
      );

      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.log("Failed to search news:", error);
    } finally {
      setLoading(false);
    }
  }

  async function searchTopic(topic: string) {
  try {
    setLoading(true);

    const response = await fetch(
      `${API_BASE_URL}/news/search?query=${encodeURIComponent(topic)}&limit=10`
    );

    const data = await response.json();
    setStories(data.stories || []);
  } catch (error) {
    console.log("Failed to search topic:", error);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchSourceNews("citi");
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
        {["citi", "myjoy", "graphic"].map((source) => (
          <Pressable
            key={source}
            onPress={() => fetchSourceNews(source)}
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
          onPress={() => {
            setQuery(topic);
            searchTopic(topic);
          }}
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
          onRefresh={() => fetchSourceNews(selectedSource)}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => 
  router.push({
    pathname: "/story",
    params: {
      title: item.title,
      url: item.url,
      source: item.source,
    },
  })
}
            >
              <Text style={styles.cardSource}>{item.source.toUpperCase()}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardLink}>Read story →</Text>
            </Pressable>
          )}
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
