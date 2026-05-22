import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackIcon } from "@/icons/back-icon";
import { RefreshIcon } from "@/icons/refresh-icon";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#006B3F",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 8,
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
          title: "Refresh",
          tabBarButton: RefreshTabButton,
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

function RefreshTabButton(props: BottomTabBarButtonProps) {
  const {
    accessibilityLabel,
    accessibilityState,
    children,
    onLongPress,
    style,
    testID,
  } = props;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onLongPress={onLongPress}
      onPress={() =>
        router.replace({
          pathname: "/",
          params: { refresh: Date.now().toString() },
        })
      }
      style={style}
      testID={testID}
    >
      {children}
    </Pressable>
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
    backgroundColor: "#F8FAFC",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 86,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: 32,
    minWidth: 64,
  },
  storyHeaderTitle: {
    color: "#0B1220",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  headerSpacer: {
    width: 64,
  },
});
