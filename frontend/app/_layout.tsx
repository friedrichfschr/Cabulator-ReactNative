import "~/global.css";

import {
  Theme,
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { useAuthStore } from "~/store/authstore";
const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [isNavigationReady, setIsNavigationReady] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  const initAuth = useAuthStore((state) => state.initAuth);
  const { token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    console.log("Initializing auth");
    initAuth();
  }, [initAuth]);

  React.useEffect(() => {
    // Only attempt navigation after layout is mounted
    if (!isNavigationReady) {
      setIsNavigationReady(true);
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    // Use requestAnimationFrame to delay navigation until after render
    requestAnimationFrame(() => {
      if (token === null || token === "") {
        // If user is not authenticated, redirect to auth group
        if (!inAuthGroup) {
          console.log("Redirecting to auth group");
          router.replace("/(auth)/signup");
        }
      } else {
        // If user is authenticated, redirect to app group
        if (!inAppGroup) {
          console.log("Redirecting to app group");
          router.replace("/(app)/chats");
        }
      }
    });
  }, [token, segments, router, isNavigationReady]);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ThemeProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
