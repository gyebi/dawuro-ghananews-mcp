import { SafeAreaView, StyleSheet, Text, View } from "react-native";

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
    backgroundColor: "#FFFDF7",
  },
  content: {
    padding: 22,
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 16,
  },
  list: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    padding: 16,
  },
  rowText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
  },
});
