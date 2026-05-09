import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme";

export default function About() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>ডেভেলপার সম্পর্কে</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.heroWrap}>
          <LinearGradient colors={["#006A4E", "#00553E"]} style={styles.heroBg} />
          <Image
            source="https://images.pexels.com/photos/14230741/pexels-photo-14230741.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300"
            style={styles.avatar}
          />
          <Text style={styles.devName}>Shoriful Alam</Text>
          <Text style={styles.devTitle}>Full-Stack Developer</Text>
          <Text style={styles.devSubtitle}>মানিকগঞ্জ অনলাইন সেবা</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.about}>
            "মানিকগঞ্জ অনলাইন সেবা" অ্যাপটি মানিকগঞ্জ জেলার নাগরিকদের জন্য একটি সম্পূর্ণ ডিজিটাল সেবা প্ল্যাটফর্ম।
            এখানে হাসপাতাল, থানা, ফায়ার সার্ভিস, রেস্টুরেন্ট, ব্লাড ডোনারসহ অনেক সেবা এক জায়গায় পাওয়া যাবে।
          </Text>
        </View>

        <View style={{ gap: 10, marginTop: 16 }}>
          <Row icon="mail" label="shoriful@manikganj.com" onPress={() => Linking.openURL("mailto:shoriful@manikganj.com")} />
          <Row icon="logo-facebook" label="Facebook Page" onPress={() => Linking.openURL("https://facebook.com")} />
          <Row icon="logo-whatsapp" label="WhatsApp Support" onPress={() => Linking.openURL("https://wa.me/8801700000000")} />
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="open" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  heroWrap: { backgroundColor: "#fff", borderRadius: 22, padding: 24, alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  heroBg: { position: "absolute", top: 0, left: 0, right: 0, height: 90 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginTop: 32, borderWidth: 4, borderColor: "#fff" },
  devName: { fontFamily: "HindSiliguri_700Bold", fontSize: 20, color: colors.textPrimary, marginTop: 12 },
  devTitle: { fontFamily: "HindSiliguri_500Medium", fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  devSubtitle: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 6 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginTop: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  about: { fontFamily: "HindSiliguri_400Regular", fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, fontFamily: "HindSiliguri_600SemiBold", fontSize: 14, color: colors.textPrimary },
});
