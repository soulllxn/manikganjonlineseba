import React from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

const TABS: { route: string; label: string; icon: any }[] = [
  { route: "/(tabs)", label: "হোম", icon: "home" },
  { route: "/(tabs)/emergency", label: "জরুরি", icon: "alert-circle" },
  { route: "/(tabs)/blood", label: "ব্লাড", icon: "water" },
  { route: "/(tabs)/upazila", label: "উপজেলা", icon: "map" },
  { route: "/(tabs)/profile", label: "প্রোফাইল", icon: "person" },
];

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (r: string) => {
    if (r === "/(tabs)") return pathname === "/" || pathname === "/(tabs)" || pathname === "";
    const segment = r.split("/").pop();
    return pathname.endsWith(`/${segment}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <View style={styles.tabBar} testID="bottom-nav">
        {TABS.map((t) => {
          const active = isActive(t.route);
          return (
            <TouchableOpacity
              key={t.route}
              testID={`tab-${t.label}`}
              style={styles.tabBtn}
              activeOpacity={0.7}
              onPress={() => router.push(t.route as any)}
            >
              <Ionicons name={t.icon} size={22} color={active ? colors.primary : "#94A3B8"} />
              <Text style={[styles.tabLabel, { color: active ? colors.primary : "#94A3B8" }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 86 : 64,
    paddingBottom: Platform.OS === "ios" ? 26 : 6,
    paddingTop: 6,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  tabLabel: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 11 },
});
