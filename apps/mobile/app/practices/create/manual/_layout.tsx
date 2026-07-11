import { Stack } from "expo-router";
import { CreatePracticeProvider } from "@/providers/CreatePracticeProvider";

export default function ManualCreateLayout() {
  return (
    <CreatePracticeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </CreatePracticeProvider>
  );
}
