import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../src/api";
import { colors } from "../src/theme";

export default function About() {
  const insets = useSafeAreaInsets();
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try { setInfo(await api.aboutInfo()); } catch {}
    })();
  }, []);

  const features: string[] = (info?.features || "").split("\n").filter((s: string) => s.trim());
  const techStack: string[] = (info?.tech_stack || "").split("\n").filter((s: string) => s.trim());

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>ডেভেলপার সম্পর্কে</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.heroWrap}>
          <LinearGradient colors={["#006A4E", "#00553E"]} style={styles.heroBg} />
          <Image
            source={info?.image || "https://images.pexels.com/photos/14230741/pexels-photo-14230741.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300"}
            style={styles.avatar}
          />
          <Text style={styles.devName}>{info?.name || "Shoriful Alam"}</Text>
          {info?.title ? <Text style={styles.devTitle}>{info.title}</Text> : null}
          {info?.subtitle ? <Text style={styles.devSubtitle}>{info.subtitle}</Text> : null}

          <View style={styles.statsRow}>
            <Stat number={info?.stat_experience_value || "৩+"} label={info?.stat_experience_label || "বছরের অভিজ্ঞতা"} />
            <View style={styles.statDivider} />
            <Stat number={info?.stat_projects_value || "২০+"} label={info?.stat_projects_label || "প্রজেক্ট"} />
            <View style={styles.statDivider} />
            <Stat number={info?.stat_upazilas_value || "৭"} label={info?.stat_upazilas_label || "উপজেলা সেবা"} />
          </View>
        </View>

        {info?.bio ? (
          <>
            <SectionTitle icon="person-circle" title="ডেভেলপার পরিচিতি" />
            <View style={styles.card}><Text style={styles.about}>{info.bio}</Text></View>
          </>
        ) : null}

        {info?.app_about || features.length ? (
          <>
            <SectionTitle icon="sparkles" title="অ্যাপ সম্পর্কে" />
            <View style={styles.card}>
              {info?.app_about ? <Text style={styles.about}>{info.app_about}</Text> : null}
              {features.length ? (
                <View style={styles.featureList}>
                  {features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <SectionTitle icon="mail" title="যোগাযোগ" />
        <View style={{ gap: 10 }}>
          {info?.email ? <Row icon="mail" label="ইমেইল" value={info.email} onPress={() => Linking.openURL(`mailto:${info.email}`)} /> : null}
          {info?.phone ? <Row icon="call" label="ফোন" value={info.phone} onPress={() => Linking.openURL(`tel:${info.phone}`)} /> : null}
          {info?.facebook ? <Row icon="logo-facebook" label="Facebook" value="Page দেখুন" onPress={() => Linking.openURL(info.facebook)} /> : null}
          {info?.whatsapp ? <Row icon="logo-whatsapp" label="WhatsApp" value="চ্যাট করুন" onPress={() => Linking.openURL(info.whatsapp)} /> : null}
          {info?.website ? <Row icon="globe" label="ওয়েবসাইট" value={info.website.replace(/^https?:\/\//, "")} onPress={() => Linking.openURL(info.website)} /> : null}
        </View>

        {techStack.length ? (
          <>
            <SectionTitle icon="hammer" title="ব্যবহৃত টেকনোলজি" />
            <View style={[styles.card, { flexDirection: "row", flexWrap: "wrap", gap: 8 }]}>
              {techStack.map((t) => (
                <View key={t} style={styles.techChip}>
                  <Text style={styles.techText}>{t}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.version}>Version 1.0.0 • Built with ❤️ for মানিকগঞ্জ</Text>
      </ScrollView>
    </View>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 22, marginBottom: 10 }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={{ fontFamily: "HindSiliguri_700Bold", fontSize: 16, color: colors.textPrimary }}>{title}</Text>
    </View>
  );
}

function Row({ icon, label, value, onPress }: { icon: any; label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.85}>
      <View style={styles.rowIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <Ionicons name="open" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  heroWrap: { backgroundColor: "#fff", borderRadius: 22, padding: 24, alignItems: "center", overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  heroBg: { position: "absolute", top: 0, left: 0, right: 0, height: 90 },
  avatar: { width: 110, height: 110, borderRadius: 55, marginTop: 32, borderWidth: 4, borderColor: "#fff" },
  devName: { fontFamily: "HindSiliguri_700Bold", fontSize: 22, color: colors.textPrimary, marginTop: 12 },
  devTitle: { fontFamily: "HindSiliguri_500Medium", fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  devSubtitle: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary, marginTop: 6 },
  statsRow: { flexDirection: "row", marginTop: 18, paddingTop: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB", width: "100%" },
  statDivider: { width: 1, backgroundColor: "#E5E7EB" },
  statNumber: { fontFamily: "HindSiliguri_700Bold", fontSize: 18, color: colors.primary },
  statLabel: { fontFamily: "HindSiliguri_500Medium", fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  about: { fontFamily: "HindSiliguri_400Regular", fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  featureList: { marginTop: 14, gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontFamily: "HindSiliguri_500Medium", fontSize: 13, color: colors.textPrimary },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  rowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: "HindSiliguri_500Medium", fontSize: 11, color: colors.textMuted },
  rowValue: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 14, color: colors.textPrimary, marginTop: 2 },
  techChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#BBF7D0" },
  techText: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.primary },
  version: { textAlign: "center", marginTop: 22, fontFamily: "HindSiliguri_500Medium", fontSize: 12, color: colors.textMuted },
});
