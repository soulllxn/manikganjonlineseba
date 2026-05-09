import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { api } from "../../src/api";
import { colors } from "../../src/theme";
import { CallButton, EmptyState } from "../../src/components/Common";

const META: Record<string, { title: string; banner: string; showImage?: boolean; subFields: string[] }> = {
  hospitals: { title: "হাসপাতাল", banner: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80", subFields: ["address"] },
  police: { title: "থানা", banner: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=1200&q=80", subFields: ["oc_name", "upazila"] },
  fire_service: { title: "ফায়ার সার্ভিস", banner: "https://images.unsplash.com/photo-1599909533733-eddafd0d8c4f?w=1200&q=80", subFields: ["address"] },
  doctors: { title: "বিশেষজ্ঞ ডাক্তার", banner: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1200&q=80", showImage: true, subFields: ["specialty", "chamber"] },
  blood_banks: { title: "ব্লাড ব্যাংক", banner: "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=1200&q=80", subFields: ["address", "details"] },
  ambulances: { title: "অ্যাম্বুলেন্স সেবা", banner: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=1200&q=80", subFields: ["vehicle_no"] },
};

export default function ServiceList() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const meta = useMemo(() => META[type || ""] || { title: type || "", banner: "", subFields: [] }, [type]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try { setItems(await api.list(type as string)); } catch {}
    })();
  }, [type]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{meta.title}</Text>
        <View style={styles.iconBtn} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={
          <View>
            <Image source={meta.banner} style={styles.banner} contentFit="cover" />
            {!["police", "fire_service"].includes(type as string) ? (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/join-request", params: { category: meta.title } } as any)}
                style={styles.joinBtn}
                testID="join-request-btn"
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.joinBtnText}>আমিও যুক্ত হতে চাই</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={<EmptyState text="কোনো তথ্য পাওয়া যায়নি" />}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`service-item-${item.id}`}>
            {meta.showImage && item.image ? (
              <Image source={item.image} style={styles.cardImg} contentFit="cover" />
            ) : (
              <View style={[styles.cardImg, styles.iconImg]}>
                <Ionicons name="business" size={26} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              {meta.subFields.map((f) =>
                item[f] ? (
                  <Text key={f} style={styles.sub} numberOfLines={2}>
                    {item[f]}
                  </Text>
                ) : null
              )}
              <Text style={styles.phone}>📞 {item.phone}</Text>
            </View>
            <CallButton phone={item.phone} testID={`call-${item.id}`} />
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
  banner: { width: "100%", height: 140, borderRadius: 16, marginTop: 14 },
  joinBtn: { marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  joinBtnText: { color: "#fff", fontFamily: "HindSiliguri_600SemiBold", fontSize: 13 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  cardImg: { width: 56, height: 56, borderRadius: 14, backgroundColor: "#ECFDF5" },
  iconImg: { alignItems: "center", justifyContent: "center" },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  sub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  phone: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 4 },
});
