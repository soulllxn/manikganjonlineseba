import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  Image as RNImage, Dimensions, Linking, RefreshControl, Alert, Animated, Easing,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/api";
import { colors } from "../../src/theme";
import { useTheme } from "../../src/themeContext";
import { HeroSlider } from "../../src/components/HeroSlider";
import { NoticeMarquee } from "../../src/components/NoticeMarquee";
import { CallButton, SectionHeader } from "../../src/components/Common";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = 12;
const ITEM_W = (width - 32 - GAP * (COLS - 1)) / COLS;

function SplashOverlay({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    Animated.timing(scale, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => onDone());
    }, 1900);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject as any, { opacity: fade, zIndex: 999 }]}>
      <LinearGradient colors={["#006A4E", "#00553E"]} style={[StyleSheet.absoluteFillObject as any, { alignItems: "center", justifyContent: "center" }]}>
        <Animated.View testID="splash-screen" style={{ transform: [{ scale }], alignItems: "center" }}>
          <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", marginBottom: 22 }}>
            <Text style={{ fontSize: 56, color: "#fff", fontFamily: "HindSiliguri_700Bold", lineHeight: 70 }}>মা</Text>
          </View>
          <Text style={{ fontSize: 36, color: "#fff", fontFamily: "HindSiliguri_700Bold", letterSpacing: 0.5 }}>মানিকগঞ্জ</Text>
          <Text style={{ fontSize: 22, color: "rgba(255,255,255,0.95)", fontFamily: "HindSiliguri_500Medium", marginTop: 4 }}>অনলাইন সেবা</Text>
        </Animated.View>
        <Text style={{ position: "absolute", bottom: 42, color: "rgba(255,255,255,0.85)", fontFamily: "HindSiliguri_400Regular", fontSize: 12, letterSpacing: 0.6 }}>Developed by Shoriful Alam</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { mode, colors: themeColors, toggle: toggleTheme } = useTheme();
  const [splashing, setSplashing] = useState(true);

  const [notices, setNotices] = useState<any[]>([]);
  const [sliders, setSliders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [dc, setDc] = useState<any | null>(null);
  const [upazilas, setUpazilas] = useState<any[]>([]);
  const [eservices, setEServices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const computeUnread = useCallback(async (list: any[]) => {
    try {
      const lastSeen = await AsyncStorage.getItem("manikganj_notif_last_seen");
      const lastSeenTs = lastSeen ? new Date(lastSeen).getTime() : 0;
      const cnt = list.filter((n) => new Date(n.created_at).getTime() > lastSeenTs).length;
      setUnread(cnt);
    } catch { setUnread(list.length); }
  }, []);

  const load = useCallback(async () => {
    try {
      const [n, s, sv, ad, d, up, es, nf] = await Promise.all([
        api.list("notices"), api.list("sliders"), api.list("services"),
        api.list("ads"), api.dc(), api.list("upazilas"), api.list("e_services"),
        api.list("notifications"),
      ]);
      setNotices(n); setSliders(s); setServices(sv);
      setAds(ad); setDc(d); setUpazilas(up); setEServices(es);
      setNotifications(nf);
      await computeUnread(nf);
    } catch (e: any) {
      console.log("home load error", e?.message);
    }
  }, [computeUnread]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, [load]);

  const onServicePress = (svc: any) => {
    if (svc.route === "coming_soon") {
      Alert.alert("শীঘ্রই আসছে", "এই সেবাটি শীঘ্রই চালু হবে।");
      return;
    }
    if (svc.route === "restaurants") return router.push("/restaurant");
    if (svc.route === "rent_a_car") return router.push("/rent-a-car");
    router.push(`/service/${svc.route}` as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: themeColors.bg }]}>
      {splashing ? <SplashOverlay onDone={() => setSplashing(false)} /> : null}
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.borderAlt }]} testID="main-header">
        <View style={styles.iconBtn} />
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>মানিকগঞ্জ অনলাইন সেবা</Text>
        <TouchableOpacity
          testID="header-notif-btn"
          onPress={() => router.push("/notifications")}
          style={styles.iconBtn}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          {unread > 0 ? (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unread > 9 ? "9+" : String(unread)}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <NoticeMarquee notices={notices} />

        <View style={{ marginTop: 14 }}>
          <HeroSlider items={sliders} />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <SectionHeader title="মানিকগঞ্জ এর সেবা সমূহ" testID="services-title" />
          <View style={styles.grid} testID="services-grid">
            {services.map((s) => (
              <TouchableOpacity
                key={s.id}
                testID={`service-card-${s.route}`}
                activeOpacity={0.85}
                onPress={() => onServicePress(s)}
                style={[styles.serviceCard, { width: ITEM_W }]}
              >
                <View style={[styles.iconBox, { backgroundColor: `${s.color}18` }]}>
                  <Ionicons name={s.icon as any} size={26} color={s.color} />
                </View>
                <Text style={styles.serviceLabel} numberOfLines={2}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ads */}
        <View style={[styles.section, { paddingHorizontal: 8 }]}>
          <View style={{ paddingHorizontal: 8 }}>
            <SectionHeader title="বিজ্ঞাপন" />
          </View>
          {ads.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {ads.map((a) => (
                <TouchableOpacity
                  testID={`ad-${a.id}`}
                  key={a.id}
                  onPress={() => a.url && Linking.openURL(a.url)}
                  style={[styles.adCard, { width: width - 16 }]}
                >
                  <Image source={a.image} style={StyleSheet.absoluteFillObject as any} contentFit="cover" />
                  <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]} style={StyleSheet.absoluteFillObject as any} />
                  <Text style={styles.adTitle}>{a.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.adPlaceholder, { marginHorizontal: 8 }]}>
              <Text style={styles.adPlaceholderText}>Ad Space Available</Text>
            </View>
          )}
        </View>

        {/* DC Card */}
        {dc && Object.keys(dc).length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="জেলা প্রশাসক" />
            <View style={styles.dcWrap} testID="dc-profile-card">
              <LinearGradient
                colors={["#E0F2EE", "#D1FAE5"]}
                style={styles.dcBgGradient}
              />
              <BlurView intensity={30} tint="light" style={styles.dcGlass}>
                <View style={styles.dcAvatarRing}>
                  <Image source={dc.image} style={styles.dcAvatar} contentFit="cover" />
                </View>
                <View style={styles.dcInfo}>
                  <Text style={styles.dcName} numberOfLines={2}>{dc.name}</Text>
                  <Text style={styles.dcDesignation} numberOfLines={2}>{dc.designation}</Text>
                  <Text style={styles.dcPhone}>📞 {dc.phone}</Text>
                  <View style={{ marginTop: 10, alignSelf: "flex-start" }}>
                    <CallButton phone={dc.phone} testID="dc-call-btn" />
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        ) : null}

        {/* Upazila Grid */}
        <View style={styles.section}>
          <SectionHeader title="মানিকগঞ্জ জেলার উপজেলাসমূহ" />
          <View style={styles.grid} testID="upazila-grid">
            {upazilas.map((u) => (
              <TouchableOpacity
                key={u.id}
                testID={`upazila-card-${u.id}`}
                onPress={() => router.push(`/upazila/${u.id}` as any)}
                activeOpacity={0.85}
                style={[styles.upazilaCard, { width: ITEM_W }]}
              >
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={styles.upazilaText} numberOfLines={2}>{u.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* E-services */}
        <View style={styles.section}>
          <SectionHeader title="নাগরিক ও ই-সেবা" />
          <View style={styles.grid}>
            {eservices.map((e) => (
              <TouchableOpacity
                key={e.id}
                testID={`eservice-${e.id}`}
                onPress={() => {
                  if (!e.url) {
                    Alert.alert("শীঘ্রই আসছে");
                    return;
                  }
                  Linking.openURL(e.url);
                }}
                activeOpacity={0.85}
                style={[styles.eServiceCard, { width: ITEM_W }]}
              >
                <Ionicons name={e.icon as any} size={22} color={colors.primary} />
                <Text style={styles.eServiceText} numberOfLines={2}>{e.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Action Buttons */}
        <View style={[styles.section, { gap: 10 }]}>
          <BottomActionRow icon="add-circle" label="যুক্ত করতে চাই" onPress={() => router.push("/join-request")} testID="join-btn" />
          <BottomActionRow icon="chatbox-ellipses" label="অভিযোগ বা পরামর্শ" onPress={() => router.push("/complaint")} testID="complaint-btn" />
        </View>
      </ScrollView>

      {/* Drawer removed — replaced by theme toggle */}
    </View>
  );
}

function BottomActionRow({ icon, label, onPress, testID }: { icon: any; label: string; onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
      style={styles.actionRow}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB",
  },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  notifBadge: {
    position: "absolute", top: 4, right: 4,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: colors.red, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#fff",
  },
  notifBadgeText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 10 },

  section: { marginTop: 18, paddingHorizontal: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  serviceCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 12,
    alignItems: "center", justifyContent: "center", minHeight: 110,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
  },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  serviceLabel: { fontSize: 12, fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, textAlign: "center", lineHeight: 18 },

  adCard: { height: 180, marginRight: 12, borderRadius: 16, overflow: "hidden", backgroundColor: "#E5E7EB" },
  adTitle: { position: "absolute", bottom: 14, left: 16, color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 17 },
  adPlaceholder: {
    height: 160, borderRadius: 16, borderWidth: 2, borderStyle: "dashed",
    borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC",
  },
  adPlaceholderText: { color: colors.textMuted, fontFamily: "HindSiliguri_600SemiBold" },

  dcWrap: { borderRadius: 24, overflow: "hidden", padding: 0 },
  dcBgGradient: { ...StyleSheet.absoluteFillObject as any, borderRadius: 24 },
  dcGlass: { padding: 18, flexDirection: "row", alignItems: "center", borderRadius: 24, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.55)", gap: 22 },
  dcAvatarRing: { padding: 4, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.85)", borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" },
  dcAvatar: { width: 92, height: 92, borderRadius: 46 },
  dcInfo: { flex: 1, paddingLeft: 16 },
  dcName: { fontSize: 19, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary, letterSpacing: 0.2 },
  dcDesignation: { fontSize: 12, fontFamily: "HindSiliguri_500Medium", color: colors.textSecondary, marginTop: 2 },
  dcPhone: { fontSize: 13, fontFamily: "HindSiliguri_600SemiBold", color: colors.primary, marginTop: 6 },

  upazilaCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 12, alignItems: "center",
    minHeight: 84, justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  upazilaText: { fontSize: 12, fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, marginTop: 6, textAlign: "center" },

  eServiceCard: {
    backgroundColor: "#F0FDF4", borderRadius: 14, padding: 12,
    alignItems: "center", minHeight: 84, justifyContent: "center",
    borderWidth: 1, borderColor: "#BBF7D0",
  },
  eServiceText: { fontSize: 11, fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, marginTop: 6, textAlign: "center" },

  actionRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 12,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
  },
  actionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  actionLabel: { flex: 1, fontFamily: "HindSiliguri_600SemiBold", fontSize: 14, color: colors.textPrimary },

  drawerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 24 },
  drawer: { width: "100%", maxWidth: 360, backgroundColor: "#fff", borderRadius: 20, padding: 22, alignItems: "center" },
  devAvatar: { width: 90, height: 90, borderRadius: 45, marginTop: 4 },
  devName: { fontSize: 18, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary, marginTop: 10 },
  devEmail: { fontSize: 13, fontFamily: "HindSiliguri_400Regular", color: colors.textSecondary, marginTop: 2 },
  devRole: { fontSize: 12, fontFamily: "HindSiliguri_500Medium", color: colors.primary, marginTop: 6, textAlign: "center" },
  drawerBtn: { width: "100%", paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 10 },
  drawerBtnText: { color: "#fff", fontFamily: "HindSiliguri_600SemiBold", fontSize: 14 },
});
