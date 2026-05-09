import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import { colors } from "../../src/theme";

export default function ProfileTab() {
  const insets = useSafeAreaInsets();

  const items: { icon: any; label: string; route: string; testID: string }[] = [
    { icon: "information-circle", label: "ডেভেলপার সম্পর্কে", route: "/about", testID: "profile-about" },
    { icon: "add-circle", label: "যুক্ত করতে চাই", route: "/join-request", testID: "profile-join" },
    { icon: "chatbox-ellipses", label: "অভিযোগ বা পরামর্শ", route: "/complaint", testID: "profile-complaint" },
    { icon: "lock-closed", label: "লগইন", route: "/admin/login", testID: "profile-admin" },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>প্রোফাইল</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.heroCard}>
          <Image
            source="https://images.pexels.com/photos/14230741/pexels-photo-14230741.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300"
            style={styles.avatar}
          />
          <Text style={styles.devName}>Shoriful Alam</Text>
          <Text style={styles.devEmail}>shoriful@manikganj.com</Text>
          <Text style={styles.tag}>Developer of মানিকগঞ্জ অনলাইন সেবা</Text>
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          {items.map((it) => (
            <TouchableOpacity
              key={it.label}
              testID={it.testID}
              activeOpacity={0.85}
              onPress={() => router.push(it.route as any)}
              style={styles.row}
            >
              <View style={styles.iconBox}><Ionicons name={it.icon} size={18} color={colors.primary} /></View>
              <Text style={styles.rowLabel}>{it.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 18, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  heroCard: { backgroundColor: "#fff", borderRadius: 20, padding: 22, alignItems: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  devName: { fontFamily: "HindSiliguri_700Bold", fontSize: 18, color: colors.textPrimary, marginTop: 12 },
  devEmail: { fontFamily: "HindSiliguri_500Medium", fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  tag: { fontFamily: "HindSiliguri_500Medium", fontSize: 12, color: colors.primary, marginTop: 8, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontFamily: "HindSiliguri_600SemiBold", fontSize: 14, color: colors.textPrimary },
});
