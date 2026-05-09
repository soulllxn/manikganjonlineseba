import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { api } from "../../../src/api";
import { colors } from "../../../src/theme";
import { CallButton, EmptyState } from "../../../src/components/Common";

const TITLES: Record<string, string> = {
  schools: "স্কুল", colleges: "কলেজ", madrasas: "মাদ্রাসা",
  blood_donors: "ব্লাড ডোনার", tourist_places: "দর্শনীয় স্থান",
};

export default function UpazilaSubList() {
  const insets = useSafeAreaInsets();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [upName, setUpName] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const ups = await api.list("upazilas");
        const found = ups.find((u: any) => u.id === id);
        setUpName(found?.name || "");
        if (found && type) {
          const data = await api.list(type, { upazila: found.name });
          setItems(data);
        }
      } catch {}
    })();
  }, [id, type]);

  const isTourist = type === "tourist_places";
  const isDonor = type === "blood_donors";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{TITLES[type as string] || type} — {upName}</Text>
        <View style={styles.iconBtn} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={<EmptyState text="কোনো তথ্য নেই" />}
        renderItem={({ item }) => (
          isTourist ? (
            <View style={styles.touristCard} testID={`item-${item.id}`}>
              <Image source={item.image} style={styles.touristImg} contentFit="cover" />
              <View style={{ padding: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.location}</Text>
                <Text style={styles.desc}>{item.description}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.card} testID={`item-${item.id}`}>
              {isDonor ? (
                <View style={styles.bloodBadge}><Text style={styles.bloodText}>{item.blood_group}</Text><Text>🩸</Text></View>
              ) : (
                <View style={styles.iconBox}><Ionicons name="business" size={24} color={colors.primary} /></View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.address ? <Text style={styles.sub}>{item.address}</Text> : null}
                <Text style={styles.phone}>📞 {item.phone}</Text>
              </View>
              <CallButton phone={item.phone} testID={`call-${item.id}`} />
            </View>
          )
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 14, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  bloodBadge: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FECACA" },
  bloodText: { fontFamily: "HindSiliguri_700Bold", color: colors.red, fontSize: 13 },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  sub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  phone: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 2 },
  touristCard: { backgroundColor: "#fff", borderRadius: 18, marginBottom: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  touristImg: { width: "100%", height: 180 },
  desc: { fontFamily: "HindSiliguri_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 20 },
});
