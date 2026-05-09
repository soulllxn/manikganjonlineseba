import { Redirect } from "expo-router";

export default function Index() {
  // Group route URL is "/" — let (tabs)/index handle the home
  return <Redirect href="/(tabs)" />;
}
