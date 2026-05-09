import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { colors } from "../../src/theme";
import { CallButton, EmptyState } from "../../src/components/Common";

const GROUPS = ["সব", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const UPAZILAS = ["সব", "মানিকগঞ্জ সদর", "শিবালয়", "দৌলতপুর", "ঘিওর", "হরিরামপুর", "সাটুরিয়া", "সিংগাইর"];

export default function BloodTab() {
  const insets = useSafeAreaInsets();
  const [donors, setDonors] = useState<any[]>([]);
  const [group, setGroup] = useState("সব");
  const [upazila, setUpazila] = useState("সব");

  useEffect(() => {
    (async () => {
      try { setDonors(await api.list("blood_donors")); } catch {}
    })();
  }, []);

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const matchGroup = group === "সব" || d.blood_group === group;
      const matchUpz = upazila === "সব" || d.upazila === upazila;
      return matchGroup && matchUpz;
    });
  }, [donors, group, upazila]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.headerTitle}>ব্লাড ডোনার</Text></View>

      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>রক্তের গ্রুপ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {GROUPS.map((g) => (
            <TouchableOpacity
              key={g}
              testID={`blood-group-${g}`}
              onPress={() => setGroup(g)}
              style={[styles.chip, group === g && styles.chipActiveRed]}
            >
              <Text style={[styles.chipText, group === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.filterLabel, { marginTop: 10 }]}>উপজেলা</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {UPAZILAS.map((u) => (
            <TouchableOpacity
              key={u}
              testID={`blood-upz-${u}`}
              onPress={() => setUpazila(u)}
              style={[styles.chip, upazila === u && styles.chipActive]}
            >
              <Text style={[styles.chipText, upazila === u && styles.chipTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {(group !== "সব" || upazila !== "সব") ? (
          <TouchableOpacity
            testID="blood-clear-filters"
            onPress={() => { setGroup("সব"); setUpazila("সব"); }}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={14} color={colors.textSecondary} />
            <Text style={styles.clearText}>ফিল্টার ক্লিয়ার ({filtered.length} ফলাফল)</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.summary}>মোট {donors.length} জন ডোনার</Text>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
        ListEmptyComponent={<EmptyState text="এই ফিল্টারে ডোনার পাওয়া যায়নি" />}
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
            <CallButton phone={item.phone} testID={`donor-call-${item.id}`} compact />
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
  filterBox: { paddingTop: 12, paddingBottom: 4, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F5F9" },
  filterLabel: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.textSecondary, paddingHorizontal: 16, marginBottom: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipActiveRed: { backgroundColor: colors.red, borderColor: colors.red },
  chipText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  clearBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8, marginTop: 8 },
  clearText: { fontFamily: "HindSiliguri_500Medium", fontSize: 12, color: colors.textSecondary },
  summary: { textAlign: "center", paddingVertical: 8, marginTop: 4, fontFamily: "HindSiliguri_500Medium", fontSize: 12, color: colors.textMuted },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  bloodBadge: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FECACA" },
  bloodText: { fontFamily: "HindSiliguri_700Bold", color: colors.red, fontSize: 14 },
  bloodEmoji: { fontSize: 14, marginTop: -2 },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  sub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
