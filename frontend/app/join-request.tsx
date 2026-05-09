import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../src/api";
import { colors } from "../src/theme";

const CATS = ["হাসপাতাল", "ডাক্তার", "ব্লাড ব্যাংক", "অ্যাম্বুলেন্স", "রেন্ট-এ-কার", "রেস্টুরেন্ট", "অন্যান্য"];

export default function JoinRequest() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(CATS[0]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !phone) return Alert.alert("নাম ও ফোন দিন");
    setLoading(true);
    try {
      await api.submitJoinRequest({ name, phone, category, address, note });
      Alert.alert("ধন্যবাদ!", "আপনার অনুরোধ গ্রহণ করা হয়েছে।", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert("ত্রুটি", e?.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>যুক্ত করতে চাই</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={styles.helper}>আপনার প্রতিষ্ঠান বা সেবাটি অ্যাপে যুক্ত করতে নিচের তথ্য পূরণ করুন।</Text>

        <Text style={styles.label}>ক্যাটাগরি</Text>
        <View style={styles.chipRow}>
          {CATS.map((c) => (
            <TouchableOpacity key={c} testID={`cat-${c}`} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>নাম / প্রতিষ্ঠানের নাম</Text>
        <TextInput testID="join-name" value={name} onChangeText={setName} style={styles.input} placeholder="পূর্ণ নাম" />

        <Text style={styles.label}>মোবাইল নম্বর</Text>
        <TextInput testID="join-phone" value={phone} onChangeText={setPhone} style={styles.input} placeholder="+8801XXXXXXXXX" keyboardType="phone-pad" />

        <Text style={styles.label}>ঠিকানা</Text>
        <TextInput testID="join-address" value={address} onChangeText={setAddress} style={styles.input} placeholder="ঠিকানা" />

        <Text style={styles.label}>বিস্তারিত (ঐচ্ছিক)</Text>
        <TextInput testID="join-note" value={note} onChangeText={setNote} style={[styles.input, { minHeight: 100, textAlignVertical: "top" }]} placeholder="বিস্তারিত তথ্য" multiline />

        <TouchableOpacity testID="join-submit" onPress={submit} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>অনুরোধ পাঠান</Text>}
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
  helper: { fontFamily: "HindSiliguri_400Regular", fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  label: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 13, color: colors.textPrimary, marginBottom: 6, marginTop: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E5E7EB" },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "HindSiliguri_600SemiBold", color: colors.textPrimary, fontSize: 12 },
  chipTextActive: { color: "#fff" },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "HindSiliguri_400Regular", borderWidth: 1, borderColor: "#E5E7EB", color: colors.textPrimary },
  btn: { marginTop: 22, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 15 },
});
