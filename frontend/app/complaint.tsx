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
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>অভিযোগ বা পরামর্শ</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.tabRow}>
          {(["complaint", "suggestion"] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.tab, type === t && styles.tabActive]}>
              <Text style={[styles.tabText, type === t && styles.tabTextActive]}>{t === "complaint" ? "অভিযোগ" : "পরামর্শ"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>আপনার নাম</Text>
        <TextInput testID="complaint-name" value={name} onChangeText={setName} style={styles.input} placeholder="পূর্ণ নাম" />

        <Text style={styles.label}>মোবাইল নম্বর</Text>
        <TextInput testID="complaint-phone" value={phone} onChangeText={setPhone} style={styles.input} placeholder="+8801XXXXXXXXX" keyboardType="phone-pad" />

        <Text style={styles.label}>বার্তা</Text>
        <TextInput testID="complaint-message" value={message} onChangeText={setMessage} style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]} placeholder="আপনার বার্তা লিখুন" multiline />

        <TouchableOpacity testID="complaint-submit" onPress={submit} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>পাঠিয়ে দিন</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary },
  tabRow: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 999, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  tabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  label: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 13, color: colors.textPrimary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "HindSiliguri_400Regular", borderWidth: 1, borderColor: "#E5E7EB", color: colors.textPrimary },
  btn: { marginTop: 22, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 15 },
});
