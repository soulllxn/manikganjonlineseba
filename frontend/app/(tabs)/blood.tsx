import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { colors } from "../../src/theme";
import { CallButton, EmptyState } from "../../src/components/Common";

const GROUPS = ["সব", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodTab() {
  const insets = useSafeAreaInsets();
  const [donors, setDonors] = useState<any[]>([]);
  const [filter, setFilter] = useState("সব");

  useEffect(() => {
    (async () => {
      try { setDonors(await api.list("blood_donors")); } catch {}
    })();
  }, []);

  const filtered = filter === "সব" ? donors : donors.filter((d) => d.blood_group === filter);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>ব্লাড ডোনার</Text></View>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <FlatList
          data={GROUPS}
          horizontal
          keyExtractor={(it) => it}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`blood-filter-${item}`}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={<EmptyState text="ডোনার পাওয়া যায়নি" />}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`donor-${item.id}`}>
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodText}>{item.blood_group}</Text>
              <Text style={styles.bloodEmoji}>🩸</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.address || item.upazila}</Text>
              <Text style={styles.sub}>📞 {item.phone}</Text>
            </View>
            <CallButton phone={item.phone} testID={`donor-call-${item.id}`} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 18, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8 },
  chipActive: { backgroundColor: colors.red, borderColor: colors.red },
  chipText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  bloodBadge: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FECACA" },
  bloodText: { fontFamily: "HindSiliguri_700Bold", color: colors.red, fontSize: 14 },
  bloodEmoji: { fontSize: 14, marginTop: -2 },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  sub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
