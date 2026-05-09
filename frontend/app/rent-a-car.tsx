import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../src/api";
import { colors } from "../src/theme";
import { CallButton, EmptyState } from "../src/components/Common";

const UPAZILAS = ["সব", "মানিকগঞ্জ সদর", "শিবালয়", "দৌলতপুর", "ঘিওর", "হরিরামপুর", "সাটুরিয়া", "সিংগাইর"];

export default function RentACarPage() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("সব");

  useEffect(() => {
    (async () => { try { setItems(await api.list("rent_a_car")); } catch {} })();
  }, []);

  const filtered = filter === "সব" ? items : items.filter((r) => r.upazila === filter);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>রেন্ট এ কার</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={UPAZILAS}
          horizontal
          keyExtractor={(it) => it}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`rent-filter-${item}`}
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/join-request", params: { category: "রেন্ট-এ-কার" } } as any)}
            style={styles.joinBtn}
            testID="rent-join-btn"
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.joinBtnText}>আমিও যুক্ত হতে চাই</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState text="কোনো গাড়ি পাওয়া যায়নি" />}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`rent-${item.id}`}>
            <View style={styles.iconBox}><Ionicons name="car-sport" size={26} color={colors.primary} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>গাড়ি নং: {item.vehicle_no}</Text>
              <Text style={styles.phone}>📞 {item.phone}</Text>
            </View>
            <CallButton phone={item.phone} testID={`rent-call-${item.id}`} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  filterRow: { paddingVertical: 10, backgroundColor: "#fff" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  iconBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  sub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  phone: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 4 },
  joinBtn: { marginBottom: 4, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  joinBtnText: { color: "#fff", fontFamily: "HindSiliguri_600SemiBold", fontSize: 13 },
});
