import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Define the initial route */}
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}
