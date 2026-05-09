import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { api } from "../src/api";
import { colors } from "../src/theme";
import { CallButton, MapButton, EmptyState } from "../src/components/Common";

const UPAZILAS = ["সব", "মানিকগঞ্জ সদর", "শিবালয়", "দৌলতপুর", "ঘিওর", "হরিরামপুর", "সাটুরিয়া", "সিংগাইর"];
const { height } = Dimensions.get("window");

export default function RestaurantPage() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("সব");
  const [menu, setMenu] = useState<{ name: string; image: string } | null>(null);

  useEffect(() => {
    (async () => {
      try { setItems(await api.list("restaurants")); } catch {}
    })();
  }, []);

  const filtered = filter === "সব" ? items : items.filter((r) => r.upazila === filter);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>রেস্টুরেন্ট</Text>
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
              testID={`rest-filter-${item}`}
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/join-request", params: { category: "রেস্টুরেন্ট" } } as any)}
            style={styles.joinBtn}
            testID="restaurant-join-btn"
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.joinBtnText}>আমিও যুক্ত হতে চাই</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState text="কোনো রেস্টুরেন্ট পাওয়া যায়নি" />}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`restaurant-${item.id}`}>
            <Image source={item.image} style={styles.cardImg} contentFit="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TouchableOpacity
                onPress={() => item.menuImageEnabled && item.menuImage && setMenu({ name: item.name, image: item.menuImage })}
                testID={`restaurant-name-${item.id}`}
              >
                <Text style={styles.name}>{item.name}</Text>
                {item.menuImageEnabled && item.menuImage ? (
                  <Text style={styles.menuHint}>📋 মেনু দেখতে নামে ট্যাপ করুন</Text>
                ) : null}
              </TouchableOpacity>
              <Text style={styles.sub} numberOfLines={2}>{item.address}</Text>
              <Text style={styles.phone}>📞 {item.phone}</Text>
            </View>
            <View style={{ gap: 8, alignItems: "center" }}>
              <MapButton url={item.mapUrl} lat={item.latitude} lng={item.longitude} testID={`restaurant-map-${item.id}`} />
              <CallButton phone={item.phone} testID={`restaurant-call-${item.id}`} />
            </View>
          </View>
        )}
      />

      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject as any} />
        <View style={styles.modalRoot}>
          <View style={styles.modalCard} testID="restaurant-menu-modal">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{menu?.name} — মেনু</Text>
              <TouchableOpacity testID="close-menu-modal" onPress={() => setMenu(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ alignItems: "center", padding: 16 }}
              showsVerticalScrollIndicator
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              {menu ? (
                <Image
                  source={menu.image}
                  style={{ width: "100%", height: height * 1.2, borderRadius: 12 }}
                  contentFit="contain"
                  transition={300}
                />
              ) : (
                <ActivityIndicator color={colors.primary} />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  filterRow: { paddingVertical: 10, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F5F9" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 18, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  cardImg: { width: 80, height: 80, borderRadius: 14, backgroundColor: "#E5E7EB" },
  name: { fontFamily: "HindSiliguri_700Bold", fontSize: 15, color: colors.textPrimary },
  menuHint: { fontFamily: "HindSiliguri_500Medium", fontSize: 11, color: colors.primary, marginTop: 2 },
  sub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  phone: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 4 },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalCard: { height: "92%", backgroundColor: "rgba(255,255,255,0.92)", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  modalHeader: { flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: colors.primary },
  modalTitle: { flex: 1, color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 15 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  joinBtn: { marginTop: 12, marginBottom: 4, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  joinBtnText: { color: "#fff", fontFamily: "HindSiliguri_600SemiBold", fontSize: 13 },
});
