import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackIcon } from "@/icons/back-icon";
import { Colors } from "@/constants/colors";
import { RefreshIcon } from "@/icons/refresh-icon";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.green,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 58 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 9),
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="refresh"
        options={{
          title: "AI Desk",
          tabBarIcon: ({ color }) => <RefreshIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="story"
        options={{
          href: null,
          header: () => <StoryHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="story/[id]"
        options={{
          href: null,
          header: () => <StoryHeader />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

function StoryHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.storyHeader, { paddingTop: insets.top + 14 }]}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <BackIcon />
      </Pressable>
      <Text style={styles.storyHeaderTitle}>Dawuro News Briefs</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  storyHeader: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: 32,
    minWidth: 64,
  },
  storyHeaderTitle: {
    color: Colors.textStrong,
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  headerSpacer: {
    width: 64,
  },
});
