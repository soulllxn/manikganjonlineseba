import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../src/api";
import { colors } from "../src/theme";

export default function ComplaintForm() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"complaint" | "suggestion">("complaint");
  const [loading, setLoading] = useState(false);

  const isComplaint = type === "complaint";
  const accent = isComplaint ? colors.red : colors.primary;
  const accentSoft = isComplaint ? "#FEF2F2" : "#ECFDF5";
  const accentBorder = isComplaint ? "#FECACA" : "#BBF7D0";

  const submit = async () => {
    if (!name || !phone || !message) {
      Alert.alert("সব ঘর পূরণ করুন");
      return;
    }
    setLoading(true);
    try {
      await api.submitComplaint({ name, phone, message, type });
      Alert.alert("ধন্যবাদ!", "আপনার বার্তা সফলভাবে পাঠানো হয়েছে।", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("ত্রুটি", e?.message || "পাঠানো ব্যর্থ");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top, backgroundColor: accentSoft }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: accent }]}>{isComplaint ? "অভিযোগ" : "পরামর্শ"}</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={[styles.modeCard, { borderColor: accentBorder, backgroundColor: "#fff" }]}>
          <View style={[styles.modeIcon, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
            <Ionicons name={isComplaint ? "warning" : "bulb"} size={20} color={accent} />
          </View>
          <Text style={[styles.modeText, { color: accent }]}>
            {isComplaint ? "আপনার অভিযোগ আমাদের কাছে গুরুত্বপূর্ণ" : "আপনার পরামর্শ অ্যাপটি আরো ভালো করতে সাহায্য করবে"}
          </Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            testID="tab-complaint"
            onPress={() => setType("complaint")}
            style={[styles.tab, isComplaint && { backgroundColor: colors.red }]}
          >
            <Ionicons name="warning" size={14} color={isComplaint ? "#fff" : colors.red} />
            <Text style={[styles.tabText, { color: isComplaint ? "#fff" : colors.red }]}>অভিযোগ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-suggestion"
            onPress={() => setType("suggestion")}
            style={[styles.tab, !isComplaint && { backgroundColor: colors.primary }]}
          >
            <Ionicons name="bulb" size={14} color={!isComplaint ? "#fff" : colors.primary} />
            <Text style={[styles.tabText, { color: !isComplaint ? "#fff" : colors.primary }]}>পরামর্শ</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>আপনার নাম</Text>
        <TextInput testID="complaint-name" value={name} onChangeText={setName} style={[styles.input, { borderColor: accentBorder }]} placeholder="পূর্ণ নাম" />

        <Text style={styles.label}>মোবাইল নম্বর</Text>
        <TextInput testID="complaint-phone" value={phone} onChangeText={setPhone} style={[styles.input, { borderColor: accentBorder }]} placeholder="+8801XXXXXXXXX" keyboardType="phone-pad" />

        <Text style={styles.label}>{isComplaint ? "অভিযোগের বিবরণ" : "পরামর্শের বিবরণ"}</Text>
        <TextInput testID="complaint-message" value={message} onChangeText={setMessage} style={[styles.input, { minHeight: 120, textAlignVertical: "top", borderColor: accentBorder }]} placeholder={isComplaint ? "আপনার অভিযোগ বিস্তারিত লিখুন" : "আপনার পরামর্শ লিখুন"} multiline />

        <TouchableOpacity testID="complaint-submit" onPress={submit} disabled={loading} style={[styles.btn, { backgroundColor: accent }, loading && { opacity: 0.6 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>পাঠিয়ে দিন</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold" },
  modeCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, marginBottom: 14 },
  modeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  modeText: { flex: 1, fontFamily: "HindSiliguri_600SemiBold", fontSize: 12 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, flexDirection: "row", paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  tabText: { fontFamily: "HindSiliguri_700Bold", fontSize: 13 },
  label: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 13, color: colors.textPrimary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "HindSiliguri_400Regular", borderWidth: 1, color: colors.textPrimary },
  btn: { marginTop: 22, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 15 },
});
