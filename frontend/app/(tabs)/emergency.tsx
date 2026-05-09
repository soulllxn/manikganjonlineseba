import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { colors } from "../../src/theme";
import { CallButton, SectionHeader } from "../../src/components/Common";

export default function Emergency() {
  const insets = useSafeAreaInsets();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [police, setPolice] = useState<any[]>([]);
  const [fire, setFire] = useState<any[]>([]);
  const [amb, setAmb] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [h, p, f, a] = await Promise.all([
          api.list("hospitals"), api.list("police"),
          api.list("fire_service"), api.list("ambulances"),
        ]);
        setHospitals(h); setPolice(p); setFire(f); setAmb(a);
      } catch {}
    })();
  }, []);

  const cards: { title: string; icon: any; color: string; route: string; count: number }[] = [
    { title: "জরুরি (৯৯৯)", icon: "alert-circle", color: "#DC2626", route: "tel:999", count: 0 },
    { title: "হাসপাতাল", icon: "medkit", color: "#E11D48", route: "/service/hospitals", count: hospitals.length },
    { title: "থানা", icon: "shield-checkmark", color: "#1E40AF", route: "/service/police", count: police.length },
    { title: "ফায়ার সার্ভিস", icon: "flame", color: "#EA580C", route: "/service/fire_service", count: fire.length },
    { title: "অ্যাম্বুলেন্স", icon: "car-sport", color: "#15803D", route: "/service/ambulances", count: amb.length },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>জরুরি সেবা</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => import("react-native").then(({ Linking }) => Linking.openURL("tel:999"))}
          style={styles.bigCard}
          testID="call-999"
        >
          <Ionicons name="call" size={26} color="#fff" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.bigTitle}>জাতীয় জরুরি নম্বর</Text>
            <Text style={styles.bigSub}>৯৯৯ — ২৪ ঘণ্টা সেবা</Text>
          </View>
          <CallButton phone="999" label="কল" />
        </TouchableOpacity>

        <SectionHeader title="দ্রুত অ্যাক্সেস" />
        <View style={styles.grid}>
          {cards.slice(1).map((c) => (
            <TouchableOpacity
              key={c.title}
              activeOpacity={0.85}
              onPress={() => router.push(c.route as any)}
              style={styles.gridCard}
              testID={`emergency-${c.title}`}
            >
              <View style={[styles.iconBox, { backgroundColor: `${c.color}18` }]}>
                <Ionicons name={c.icon} size={26} color={c.color} />
              </View>
              <Text style={styles.gridTitle}>{c.title}</Text>
              <Text style={styles.gridSub}>{c.count} টি</Text>
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
  bigCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.red, padding: 18, borderRadius: 18, marginBottom: 18 },
  bigTitle: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 16 },
  bigSub: { color: "rgba(255,255,255,0.9)", fontFamily: "HindSiliguri_500Medium", fontSize: 12, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: { flexBasis: "48%", flexGrow: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  gridTitle: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  gridSub: { fontFamily: "HindSiliguri_500Medium", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
