import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Modal, Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { api, clearToken, getToken } from "../../src/api";
import { colors } from "../../src/theme";

type FieldDef = { key: string; label: string; type: "text" | "number" | "url" | "phone" | "longtext" | "boolean"; placeholder?: string };

const SCHEMAS: Record<string, { title: string; fields: FieldDef[] }> = {
  notices: { title: "নোটিশ", fields: [
    { key: "text", label: "নোটিশের বার্তা", type: "longtext" },
    { key: "order", label: "ক্রম", type: "number" },
  ]},
  sliders: { title: "ইমেজ স্লাইডার", fields: [
    { key: "title", label: "টাইটেল", type: "text" },
    { key: "image", label: "ইমেজ URL", type: "url" },
    { key: "order", label: "ক্রম", type: "number" },
  ]},
  services: { title: "সেবা", fields: [
    { key: "name", label: "সেবার নাম", type: "text" },
    { key: "icon", label: "Ionicons আইকন নাম", type: "text", placeholder: "যেমন: medkit" },
    { key: "color", label: "রং (HEX)", type: "text", placeholder: "#006A4E" },
    { key: "route", label: "Route", type: "text", placeholder: "hospitals" },
    { key: "order", label: "ক্রম", type: "number" },
  ]},
  ads: { title: "বিজ্ঞাপন", fields: [
    { key: "title", label: "টাইটেল", type: "text" },
    { key: "image", label: "ইমেজ URL", type: "url" },
    { key: "url", label: "ক্লিক URL", type: "url" },
    { key: "order", label: "ক্রম", type: "number" },
  ]},
  district_commissioner: { title: "জেলা প্রশাসক", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "designation", label: "পদবি", type: "text" },
    { key: "phone", label: "মোবাইল", type: "phone" },
    { key: "image", label: "ছবির URL", type: "url" },
  ]},
  hospitals: { title: "হাসপাতাল", fields: [
    { key: "name", label: "হাসপাতালের নাম", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
  ]},
  police: { title: "থানা", fields: [
    { key: "name", label: "থানার নাম", type: "text" },
    { key: "oc_name", label: "ওসি নাম", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  fire_service: { title: "ফায়ার সার্ভিস", fields: [
    { key: "name", label: "স্টেশনের নাম", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "address", label: "ঠিকানা", type: "text" },
  ]},
  doctors: { title: "ডাক্তার", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "specialty", label: "বিশেষত্ব", type: "text" },
    { key: "chamber", label: "চেম্বার / হাসপাতাল", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "image", label: "ছবি URL", type: "url" },
  ]},
  blood_banks: { title: "ব্লাড ব্যাংক", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "details", label: "বিস্তারিত", type: "longtext" },
  ]},
  ambulances: { title: "অ্যাম্বুলেন্স", fields: [
    { key: "name", label: "সেবার নাম", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "vehicle_no", label: "গাড়ির নম্বর", type: "text" },
  ]},
  rent_a_car: { title: "রেন্ট-এ-কার", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "vehicle_no", label: "গাড়ির নম্বর", type: "text" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  restaurants: { title: "রেস্টুরেন্ট", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "image", label: "ইমেজ URL", type: "url" },
    { key: "menuImage", label: "মেনু ইমেজ URL", type: "url" },
    { key: "menuImageEnabled", label: "মেনু ইমেজ চালু", type: "boolean" },
    { key: "mapUrl", label: "Google Map URL", type: "url" },
    { key: "latitude", label: "Latitude", type: "number" },
    { key: "longitude", label: "Longitude", type: "number" },
    { key: "mapEnabled", label: "ম্যাপ চালু (অফ করলে ম্যাপ আইকন লুকাবে)", type: "boolean" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  upazilas: { title: "উপজেলা", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "banner", label: "ব্যানার URL", type: "url" },
    { key: "uno_name", label: "UNO নাম", type: "text" },
    { key: "uno_phone", label: "UNO ফোন", type: "phone" },
    { key: "uno_image", label: "UNO ছবি URL", type: "url" },
    { key: "area", label: "আয়তন (যেমন: ২১৬.৬৩ বর্গ কিমি)", type: "text" },
    { key: "stats", label: "পরিসংখ্যান", type: "longtext" },
    { key: "order", label: "ক্রম", type: "number" },
  ]},
  schools: { title: "স্কুল", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  colleges: { title: "কলেজ", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  madrasas: { title: "মাদ্রাসা", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  blood_donors: { title: "ব্লাড ডোনার", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "blood_group", label: "ব্লাড গ্রুপ (যেমন: A+)", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  tourist_places: { title: "দর্শনীয় স্থান", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "description", label: "বিবরণ", type: "longtext" },
    { key: "location", label: "অবস্থান", type: "text" },
    { key: "image", label: "ইমেজ URL", type: "url" },
    { key: "upazila", label: "উপজেলা", type: "text" },
  ]},
  e_services: { title: "ই-সেবা", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "icon", label: "আইকন", type: "text" },
    { key: "url", label: "URL", type: "url" },
    { key: "order", label: "ক্রম", type: "number" },
  ]},
  notifications: { title: "নোটিফিকেশন (পুশ)", fields: [
    { key: "title", label: "শিরোনাম", type: "text" },
    { key: "body", label: "বার্তা", type: "longtext" },
    { key: "image", label: "ছবির URL (ঐচ্ছিক)", type: "url" },
    { key: "link", label: "লিংক (ঐচ্ছিক)", type: "url" },
  ]},
  complaints: { title: "অভিযোগ/পরামর্শ", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "message", label: "বার্তা", type: "longtext" },
    { key: "type", label: "ধরন", type: "text" },
  ]},
  join_requests: { title: "যুক্ত হবার অনুরোধ", fields: [
    { key: "name", label: "নাম", type: "text" },
    { key: "phone", label: "ফোন", type: "phone" },
    { key: "category", label: "ক্যাটাগরি", type: "text" },
    { key: "address", label: "ঠিকানা", type: "text" },
    { key: "note", label: "বিস্তারিত", type: "longtext" },
  ]},
};

const COLLECTION_ORDER = [
  "notices", "sliders", "services", "ads", "district_commissioner",
  "hospitals", "police", "fire_service", "doctors", "blood_banks",
  "ambulances", "rent_a_car", "restaurants", "upazilas",
  "schools", "colleges", "madrasas", "blood_donors", "tourist_places",
  "e_services", "notifications", "complaints", "join_requests",
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const [authChecking, setAuthChecking] = useState(true);
  const [active, setActive] = useState("notices");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");

  const filteredTabs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COLLECTION_ORDER;
    return COLLECTION_ORDER.filter((c) => {
      const t = SCHEMAS[c].title.toLowerCase();
      return t.includes(q) || c.toLowerCase().includes(q);
    });
  }, [search]);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (!t) { router.replace("/admin/login"); return; }
      try { await api.me(); setAuthChecking(false); }
      catch { router.replace("/admin/login"); }
    })();
  }, []);

  const schema = SCHEMAS[active];

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminList(active);
      setItems(data);
    } catch (e: any) {
      if (String(e.message).includes("401")) router.replace("/admin/login");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!authChecking) load(); }, [active, authChecking]);

  const openCreate = () => {
    const blank: any = { is_active: true };
    schema.fields.forEach((f) => {
      if (f.type === "boolean") blank[f.key] = true;
      else blank[f.key] = f.type === "number" ? 0 : "";
    });
    setForm(blank);
    setEditing({ __new: true });
  };

  const openEdit = (item: any) => {
    setForm({ ...item });
    setEditing(item);
  };

  const save = async () => {
    try {
      const payload: any = { is_active: form.is_active !== false };
      schema.fields.forEach((f) => {
        if (f.type === "boolean") {
          payload[f.key] = form[f.key] !== false;
          return;
        }
        if (form[f.key] === undefined || form[f.key] === "") return;
        payload[f.key] = f.type === "number" ? Number(form[f.key]) : form[f.key];
      });
      if (editing?.__new) {
        if (active === "district_commissioner") {
          await api.adminUpsertDC(payload);
        } else {
          await api.adminCreate(active, payload);
        }
      } else {
        await api.adminUpdate(active, editing.id, payload);
      }
      setEditing(null); setForm({});
      await load();
    } catch (e: any) { Alert.alert("সংরক্ষণ ব্যর্থ", e.message); }
  };

  const remove = (item: any) => {
    Alert.alert("নিশ্চিত?", "এই আইটেমটি মুছবেন?", [
      { text: "বাতিল" },
      { text: "মুছুন", style: "destructive", onPress: async () => {
        try { await api.adminDelete(active, item.id); load(); }
        catch (e: any) { Alert.alert("ত্রুটি", e.message); }
      }},
    ]);
  };

  const toggle = async (item: any) => {
    try {
      await api.adminUpdate(active, item.id, { is_active: !item.is_active });
      load();
    } catch (e: any) { Alert.alert("ত্রুটি", e.message); }
  };

  const logout = async () => { await clearToken(); router.replace("/admin/login"); };

  if (authChecking) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.top}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.iconBtn}>
          <Ionicons name="home" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>অ্যাডমিন প্যানেল</Text>
        <TouchableOpacity testID="admin-logout-btn" onPress={logout} style={styles.iconBtn}>
          <Ionicons name="log-out" size={20} color={colors.red} />
        </TouchableOpacity>
      </View>

      {/* Sidebar tabs */}
      <View style={styles.sidebar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            testID="admin-tab-search"
            value={search}
            onChangeText={setSearch}
            placeholder="ম্যানেজমেন্ট সেকশন খুঁজুন..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.tabsWrap}>
          {filteredTabs.length === 0 ? (
            <Text style={styles.noTabResult}>কোনো সেকশন মিলেনি</Text>
          ) : (
            filteredTabs.map((item) => (
              <TouchableOpacity
                key={item}
                testID={`tab-${item}`}
                onPress={() => setActive(item)}
                style={[styles.tab, active === item && styles.tabActive]}
              >
                <Text style={[styles.tabText, active === item && styles.tabTextActive]}>{SCHEMAS[item].title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{schema.title} ({items.length})</Text>
        {active !== "complaints" && active !== "join_requests" ? (
          <TouchableOpacity testID="admin-add-btn" onPress={openCreate} style={styles.addBtn}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>{active === "district_commissioner" ? "সেট করুন" : "নতুন"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} /> : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<Text style={styles.empty}>কোনো আইটেম নেই</Text>}
          renderItem={({ item }) => (
            <View style={styles.row} testID={`row-${item.id}`}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.name || item.title || item.text || item.message || item.id}
                </Text>
                {item.phone ? <Text style={styles.rowSub}>📞 {item.phone}</Text> : null}
                {item.address ? <Text style={styles.rowSub} numberOfLines={1}>{item.address}</Text> : null}
                {item.specialty ? <Text style={styles.rowSub}>{item.specialty}</Text> : null}
                {item.upazila ? <Text style={styles.rowSub}>📍 {item.upazila}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Switch
                  value={item.is_active !== false}
                  onValueChange={() => toggle(item)}
                  trackColor={{ false: "#CBD5E1", true: colors.primary }}
                  thumbColor="#fff"
                />
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity testID={`edit-${item.id}`} onPress={() => openEdit(item)} style={styles.smallBtn}>
                    <Ionicons name="create" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity testID={`delete-${item.id}`} onPress={() => remove(item)} style={[styles.smallBtn, { backgroundColor: "#FEF2F2" }]}>
                    <Ionicons name="trash" size={16} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Form Modal */}
      <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)} transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing?.__new ? "নতুন" : "সম্পাদনা"} {schema.title}</Text>
              <TouchableOpacity testID="form-close-btn" onPress={() => setEditing(null)}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {schema.fields.map((f) => (
                <View key={f.key} style={{ marginBottom: 12 }}>
                  {f.type === "boolean" ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}>
                      <Switch
                        testID={`field-${f.key}`}
                        value={form[f.key] !== false}
                        onValueChange={(v) => setForm({ ...form, [f.key]: v })}
                        trackColor={{ false: "#CBD5E1", true: colors.primary }}
                        thumbColor="#fff"
                      />
                      <Text style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}>{f.label}</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                      <TextInput
                        testID={`field-${f.key}`}
                        value={String(form[f.key] ?? "")}
                        onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                        style={[styles.fieldInput, f.type === "longtext" && { minHeight: 80, textAlignVertical: "top" }]}
                        keyboardType={f.type === "number" ? "numeric" : f.type === "phone" ? "phone-pad" : "default"}
                        placeholder={f.placeholder || ""}
                        multiline={f.type === "longtext"}
                      />
                      {f.type === "url" && form[f.key] ? (
                        <Image source={form[f.key]} style={styles.preview} contentFit="cover" />
                      ) : null}
                    </>
                  )}
                </View>
              ))}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
                <Switch
                  value={form.is_active !== false}
                  onValueChange={(v) => setForm({ ...form, is_active: v })}
                  trackColor={{ false: "#CBD5E1", true: colors.primary }}
                />
                <Text style={styles.fieldLabel}>সক্রিয়</Text>
              </View>
              <TouchableOpacity testID="form-save-btn" onPress={save} style={[styles.saveBtn, { marginTop: 18 }]}>
                <Text style={styles.saveBtnText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E7EB" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  topTitle: { flex: 1, textAlign: "center", fontFamily: "HindSiliguri_700Bold", fontSize: 16, color: colors.textPrimary },
  sidebar: { paddingVertical: 10, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F1F5F9" },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 12, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", gap: 6 },
  searchInput: { flex: 1, fontFamily: "HindSiliguri_500Medium", fontSize: 13, color: colors.textPrimary, paddingVertical: 4 },
  tabsWrap: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 6 },
  noTabResult: { paddingVertical: 8, paddingHorizontal: 4, fontFamily: "HindSiliguri_500Medium", fontSize: 12, color: colors.textMuted },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "#F1F5F9", marginBottom: 4, borderWidth: 1, borderColor: "#E5E7EB" },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 12, color: colors.textPrimary },
  tabTextActive: { color: "#fff" },
  listHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, justifyContent: "space-between" },
  listTitle: { fontFamily: "HindSiliguri_700Bold", fontSize: 16, color: colors.textPrimary },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  addBtnText: { color: "#fff", fontFamily: "HindSiliguri_600SemiBold", fontSize: 13 },
  empty: { textAlign: "center", color: colors.textMuted, fontFamily: "HindSiliguri_500Medium", marginTop: 32 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  rowTitle: { fontFamily: "HindSiliguri_700Bold", fontSize: 14, color: colors.textPrimary },
  rowSub: { fontFamily: "HindSiliguri_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  smallBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  modalRoot: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { height: "88%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: colors.primary },
  modalTitle: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 16 },
  fieldLabel: { fontFamily: "HindSiliguri_600SemiBold", fontSize: 13, color: colors.textPrimary, marginBottom: 6 },
  fieldInput: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12, fontFamily: "HindSiliguri_400Regular", fontSize: 14, borderWidth: 1, borderColor: "#E5E7EB", color: colors.textPrimary },
  preview: { width: 80, height: 80, borderRadius: 8, marginTop: 6 },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 15 },
});
