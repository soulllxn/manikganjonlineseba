import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../src/api";
import { colors } from "../../src/theme";

export default function UpazilaDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [upazila, setUpazila] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.list("upazilas");
        const found = list.find((u: any) => u.id === id);
        setUpazila(found || null);
      } catch {}
    })();
  }, [id]);

  const ICONS: Record<string, any> = {
    schools: "school",
    colleges: "library",
    madrasas: "book",
    blood_donors: "water",
    tourist_places: "image",
    coming_soon: "time",
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{upazila?.name || "উপজেলা"}</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ height: 180 }}>
          <Image source={upazila?.banner} style={StyleSheet.absoluteFillObject as any} contentFit="cover" />
          <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFillObject as any} />
          <Text style={styles.banTitle}>{upazila?.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>সেবাসমূহ</Text>
          <View style={styles.grid}>
            {(upazila?.buttons || []).filter((b: any) => b.is_active !== false).map((b: any) => (
              <TouchableOpacity
                key={b.type}
                testID={`upazila-btn-${b.type}`}
                onPress={() => {
                  if (b.type === "coming_soon") return Alert.alert("শীঘ্রই আসছে");
                  router.push({ pathname: "/upazila/[id]/[type]", params: { id: id as string, type: b.type } } as any);
                }}
                activeOpacity={0.85}
                style={styles.tile}
              >
                <View style={styles.tileIcon}>
                  <Ionicons name={ICONS[b.type] || "ellipsis-horizontal"} size={24} color={colors.primary} />
                </View>
                <Text style={styles.tileText}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  banTitle: { position: "absolute", bottom: 16, left: 18, color: "#fff", fontSize: 22, fontFamily: "HindSiliguri_700Bold" },
  section: { padding: 16 },
  sectionTitle: { fontFamily: "HindSiliguri_700Bold", fontSize: 16, color: colors.textPrimary, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { flexBasis: "31%", flexGrow: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  tileIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tileText: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.textPrimary, textAlign: "center" },
});
