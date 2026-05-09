import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api } from "../../src/api";
import { colors } from "../../src/theme";

export default function UpazilaTab() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try { setItems(await api.list("upazilas")); } catch {}
    })();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>উপজেলাসমূহ</Text></View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`upazila-${item.id}`}
            onPress={() => router.push(`/upazila/${item.id}` as any)}
            style={styles.card}
            activeOpacity={0.85}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="map" size={28} color={colors.primary} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>বিস্তারিত</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 18, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)", alignItems: "flex-start" },
  iconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 15, color: colors.textPrimary },
  cta: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  ctaText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.primary, fontSize: 12 },
});
