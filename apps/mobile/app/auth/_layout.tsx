import { Stack } from "expo-router";

export default function AuthWebCompatLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
