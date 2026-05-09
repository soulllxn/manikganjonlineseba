import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { api, getToken, setToken } from "../../src/api";
import { colors } from "../../src/theme";

export default function AdminLogin() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("admin@manikganj.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        try {
          await api.me();
          router.replace("/admin");
        } catch {}
      }
    })();
  }, []);

  const submit = async () => {
    if (!email || !password) return Alert.alert("ইমেইল ও পাসওয়ার্ড দিন");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      await setToken(res.access_token);
      router.replace("/admin");
    } catch (e: any) {
      Alert.alert("লগইন ব্যর্থ", e?.message || "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient colors={["#006A4E", "#00553E"]} style={styles.headerWrap}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="login-back-btn">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoCircle}>
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>অ্যাডমিন প্যানেল</Text>
        <Text style={styles.subtitle}>মানিকগঞ্জ অনলাইন সেবা</Text>
      </LinearGradient>

      <View style={styles.formWrap}>
        <Text style={styles.label}>ইমেইল</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail" size={18} color={colors.textMuted} />
          <TextInput
            testID="admin-login-email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="admin@manikganj.com"
          />
        </View>

        <Text style={styles.label}>পাসওয়ার্ড</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
          <TextInput
            testID="admin-login-password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!showPwd}
            placeholder="••••••••"
          />
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
            <Ionicons name={showPwd ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity testID="admin-login-submit" onPress={submit} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>লগইন করুন</Text>}
        </TouchableOpacity>

        <Text style={styles.hint}>ডিফল্ট: admin@manikganj.com / Admin@123</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingTop: 30, paddingBottom: 50, alignItems: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { position: "absolute", top: 24, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  title: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 22, marginTop: 14 },
  subtitle: { color: "rgba(255,255,255,0.9)", fontFamily: "HindSiliguri_500Medium", fontSize: 13, marginTop: 2 },
  formWrap: { padding: 24, marginTop: -20, borderRadius: 24, backgroundColor: "#fff", marginHorizontal: 18, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  label: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 13, color: colors.textPrimary, marginTop: 8, marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 14, gap: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  input: { flex: 1, paddingVertical: 12, fontFamily: "HindSiliguri_400Regular", fontSize: 14, color: colors.textPrimary },
  btn: { marginTop: 22, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 15 },
  hint: { textAlign: "center", color: colors.textMuted, fontSize: 11, marginTop: 14, fontFamily: "HindSiliguri_400Regular" },
});
