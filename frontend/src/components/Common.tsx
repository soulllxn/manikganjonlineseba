import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Linking, Platform, Alert, Animated, Easing, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export function CallButton({ phone, label = "কল করুন", testID, compact = false }: { phone: string; label?: string; testID?: string; compact?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, friction: 6, tension: 120 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 100 }).start();
  };

  const onPress = async () => {
    if (!phone) { Alert.alert("ফোন নম্বর নেই"); return; }
    const url = `tel:${phone.replace(/\s+/g, "")}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else if (Platform.OS === "web") window.open(url);
      else Alert.alert("ফোন কল সম্ভব নয়", phone);
    } catch { Alert.alert("ফোন কল ব্যর্থ"); }
  };

  return (
    <Animated.View testID={testID} style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "center",
          backgroundColor: colors.primary,
          paddingVertical: compact ? 8 : 10, paddingHorizontal: compact ? 12 : 16,
          borderRadius: 999, gap: 6,
        }}>
          <Ionicons name="call" size={compact ? 14 : 16} color="#fff" />
          <Text style={{ color: "#fff", fontFamily: "HindSiliguri_600SemiBold", fontSize: compact ? 12 : 13 }}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function MapButton({ url, lat, lng, testID }: { url?: string; lat?: number; lng?: number; testID?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const onPress = async () => {
    let target = url;
    if (!target && lat != null && lng != null) target = `https://www.google.com/maps?q=${lat},${lng}`;
    if (!target) { Alert.alert("ম্যাপ লোকেশন নেই"); return; }
    try { await Linking.openURL(target); } catch { Alert.alert("Map ওপেন ব্যর্থ"); }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable testID={testID} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
          borderWidth: 1, borderColor: "#DBEAFE",
        }}>
          <Ionicons name="location" size={18} color="#1D4ED8" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function SectionHeader({ title, testID }: { title: string; testID?: string }) {
  return (
    <View testID={testID} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 4 }}>
      <View style={{ width: 4, height: 22, backgroundColor: colors.primary, borderRadius: 2, marginRight: 10 }} />
      <Text style={{ fontSize: 18, fontFamily: "HindSiliguri_700Bold", color: colors.textPrimary }}>{title}</Text>
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={{ paddingVertical: 24, alignItems: "center" }}>
      <Ionicons name="document-text-outline" size={36} color={colors.textMuted} />
      <Text style={{ marginTop: 8, color: colors.textMuted, fontFamily: "HindSiliguri_500Medium" }}>{text}</Text>
    </View>
  );
}
