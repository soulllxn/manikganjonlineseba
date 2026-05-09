import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../src/api";
import { colors } from "../src/theme";
import { EmptyState } from "../src/components/Common";

const LAST_SEEN_KEY = "manikganj_notif_last_seen";

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api.list("notifications");
      setItems(data);
      await AsyncStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নোটিফিকেশন</Text>
        <View style={styles.iconBtn} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState text="কোনো নোটিফিকেশন নেই" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`notif-${item.id}`}
            activeOpacity={0.85}
            onPress={() => item.link && Linking.openURL(item.link)}
            style={styles.card}
          >
            <View style={styles.iconBubble}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
              {item.body ? <Text style={styles.body} numberOfLines={4}>{item.body}</Text> : null}
              {item.image ? (
                <Image source={item.image} style={styles.previewImg} contentFit="cover" />
              ) : null}
              <Text style={styles.time}>
                {(() => {
                  try {
                    const d = item.created_at ? new Date(item.created_at) : null;
                    if (!d || isNaN(d.getTime())) return "";
                    return d.toLocaleString();
                  } catch { return ""; }
                })()}
              </Text>
              {item.link ? <Text style={styles.linkText}>🔗 বিস্তারিত দেখুন</Text> : null}
            </View>
          </TouchableOpacity>
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
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  iconBubble: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  body: { fontFamily: "HindSiliguri_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  previewImg: { width: "100%", height: 140, borderRadius: 10, marginTop: 8 },
  time: { fontFamily: "HindSiliguri_400Regular", fontSize: 11, color: colors.textMuted, marginTop: 8 },
  linkText: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 4 },
});
