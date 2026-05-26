import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

const menuItems = ["Manage sources", "Notifications", "About Dawuro", "Privacy policy"];

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Menu</Text>
        <View style={styles.list}>
          {menuItems.map((item) => (
            <View key={item} style={styles.row}>
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    color: Colors.textStrong,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 14,
  },
  list: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  rowText: {
    color: Colors.textStrong,
    fontSize: 15,
    fontWeight: "800",
  },
});
