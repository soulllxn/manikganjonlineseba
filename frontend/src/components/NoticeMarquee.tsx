import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import { colors } from "../theme";

const { width } = Dimensions.get("window");

export function NoticeMarquee({ notices }: { notices: { id: string; text: string }[] }) {
  const x = useRef(new Animated.Value(width)).current;

  const text = notices.map((n) => n.text).join("   •   ");

  useEffect(() => {
    if (!notices.length) return;
    const loop = () => {
      x.setValue(width);
      Animated.timing(x, {
        toValue: -width * 2,
        duration: Math.max(8000, text.length * 120),
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [text]);

  if (!notices.length) return null;

  return (
    <View testID="notice-slider" style={styles.bar}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>নোটিশ</Text>
      </View>
      <View style={styles.scrollArea}>
        <Animated.Text
          numberOfLines={1}
          style={[styles.text, { transform: [{ translateX: x }] }]}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    marginHorizontal: 16, marginTop: 10,
    overflow: "hidden", height: 38,
    borderWidth: 1, borderColor: "#FECACA",
  },
  badge: {
    backgroundColor: colors.red, paddingHorizontal: 14, height: "100%",
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#fff", fontFamily: "HindSiliguri_700Bold", fontSize: 13 },
  scrollArea: { flex: 1, overflow: "hidden", justifyContent: "center" },
  text: { color: "#7F1D1D", fontFamily: "HindSiliguri_500Medium", fontSize: 13, paddingHorizontal: 12 },
});
