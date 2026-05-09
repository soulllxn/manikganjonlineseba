import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, Animated } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 64, 500);

export function HeroSlider({ items }: { items: { id: string; title?: string; image: string }[] }) {
  const ref = useRef<FlatList<any>>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => {
      setIdx((p) => {
        const n = (p + 1) % items.length;
        ref.current?.scrollToIndex({ index: n, animated: true });
        return n;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <View testID="hero-slider" style={{ marginTop: 8 }}>
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(it) => it.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 32 }}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
          setIdx(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_WIDTH, marginRight: 12 }]}>
            <Image source={item.image} style={StyleSheet.absoluteFillObject as any} contentFit="cover" transition={400} />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
              style={StyleSheet.absoluteFillObject as any}
            />
            {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
          </View>
        )}
      />
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { height: 160, borderRadius: 18, overflow: "hidden", backgroundColor: "#E5E7EB" },
  title: {
    position: "absolute", bottom: 14, left: 16, right: 16,
    color: "#fff", fontSize: 18, fontFamily: "HindSiliguri_700Bold",
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CBD5E1" },
  dotActive: { width: 22, backgroundColor: colors.primary },
});
