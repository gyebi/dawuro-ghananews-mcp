import React from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function StoryScreen() {
  const params = useLocalSearchParams();

  const title = String(params.title || "");
  const source = String(params.source || "");
  const url = String(params.url || "");

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.source}>{source.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>

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
    backgroundColor: "#FFFDF7",
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "#006B3F",
    fontSize: 16,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  source: {
    color: "#CE1126",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 12,
  },
  title: {
    color: "#111827",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 34,
  },
  readButton: {
    backgroundColor: "#006B3F",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 2,
    borderColor: "#FCD116",
  },
  readButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});