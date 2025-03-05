import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

interface AuthState {
  isLoadingLoggin: boolean;
  isLoadingCreateAccount: boolean;
  isLoadingAppleAuth: boolean;
  token: string;
  userId: string;
  appleSignIn: () => Promise<void>;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  createAccount: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoadingCreateAccount: false,
  isLoadingLoggin: false,
  isLoadingAppleAuth: false,
  token: "",
  userId: "",

  appleSignIn: async () => {
    try {
      set({ isLoadingAppleAuth: true });
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Log the credential to help with debugging
      console.log("Apple credential received:", {
        email: credential.email,
        hasFullName: !!credential.fullName,
        hasAuthCode: !!credential.authorizationCode,
      });

      const res = await axiosInstance.post("/users/apple", { credential });
      const token = res.data.token;

      if (!token) {
        throw new Error("No token received from server");
      }

      await AsyncStorage.setItem("token", token);

      const decodedToken: any = jwtDecode(token);
      set({ token, userId: decodedToken.userId });
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        console.log("Apple sign-in was canceled by the user");
      } else if (e.code === "ERR_INVALID_RESPONSE") {
        console.log("Invalid response from Apple authentication");
        Alert.alert(
          "Authentication Error",
          "Received an invalid response from Apple. Please try again."
        );
      } else {
        console.error("Apple Sign In Error:", e);
        Alert.alert(
          "Authentication Error",
          e.message || "An error occurred during Apple authentication"
        );
      }
    } finally {
      set({ isLoadingAppleAuth: false });
    }
  },

  setToken: (token: string) => {
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        set({ token, userId: decodedToken.userId });
      } catch (error) {
        console.error("Error decoding token:", error);
        set({ token, userId: "" });
      }
    } else {
      set({ token, userId: "" });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoadingLoggin: true });
      const res = await axiosInstance.post("/users/login", { email, password });
      const token = res.data.token;
      await AsyncStorage.setItem("token", token);

      const decodedToken: any = jwtDecode(token);
      set({ token, userId: decodedToken.userId });
    } catch (error) {
      console.log(error);
      Alert.alert((error as any).response?.data?.message);
    } finally {
      set({ isLoadingLoggin: false });
    }
  },

  createAccount: async (email: string, password: string, name: string) => {
    try {
      set({ isLoadingCreateAccount: true });
      const res = await axiosInstance.post("/users/create-account", {
        email,
        password,
        name,
      });
      const token = res.data.token;
      await AsyncStorage.setItem("token", token);

      const decodedToken: any = jwtDecode(token);
      set({ token, userId: decodedToken.userId });
    } catch (error) {
      console.log(error);
      Alert.alert((error as any).response?.data?.message);
    } finally {
      set({ isLoadingCreateAccount: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ token: "", userId: "" });
  },

  initAuth: async () => {
    console.log("Initializing auth");
    const token = await AsyncStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        set({ token, userId: decodedToken.userId });
      } catch (error) {
        console.error("Error initializing auth:", error);
        await AsyncStorage.removeItem("token");
      }
    }
  },
}));
