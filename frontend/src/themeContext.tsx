import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const lightColors = {
  primary: "#006A4E",
  primaryDark: "#00553E",
  red: "#F42A41",
  redDark: "#D91F33",
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",
  surfaceGlass: "rgba(255,255,255,0.78)",
  textPrimary: "#0A0A0A",
  textSecondary: "#4B5563",
  textMuted: "#94A3B8",
  border: "rgba(0,0,0,0.06)",
  borderAlt: "#E5E7EB",
  shadow: "rgba(0,0,0,0.08)",
};

export const darkColors = {
  primary: "#10B981",
  primaryDark: "#059669",
  red: "#FB7185",
  redDark: "#F43F5E",
  bg: "#0B1220",
  surface: "#111827",
  surfaceAlt: "#1F2937",
  surfaceGlass: "rgba(17,24,39,0.78)",
  textPrimary: "#F1F5F9",
  textSecondary: "#CBD5E1",
  textMuted: "#64748B",
  border: "rgba(255,255,255,0.08)",
  borderAlt: "#1F2937",
  shadow: "rgba(0,0,0,0.5)",
};

type Mode = "light" | "dark";
type Ctx = { mode: Mode; colors: typeof lightColors; toggle: () => void };

const ThemeContext = createContext<Ctx>({ mode: "light", colors: lightColors, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("manikganj_theme_mode");
        if (saved === "dark" || saved === "light") setMode(saved);
      } catch {}
    })();
  }, []);

  const toggle = async () => {
    const next: Mode = mode === "light" ? "dark" : "light";
    setMode(next);
    try { await AsyncStorage.setItem("manikganj_theme_mode", next); } catch {}
  };

  const colors = mode === "dark" ? darkColors : lightColors;
  return <ThemeContext.Provider value={{ mode, colors, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
