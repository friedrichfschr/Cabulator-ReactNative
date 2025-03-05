import {
  KeyboardAvoidingView,
  Pressable,
  View,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authstore";
import * as AppleAuthentication from "expo-apple-authentication";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

const isAppleSignInAvailable = async () => {
  const isAvailable = await AppleAuthentication.isAvailableAsync();
  return isAvailable;
};

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const {
    token,
    createAccount,
    isLoadingCreateAccount,
    appleSignIn,
    isLoadingAppleAuth,
  } = useAuthStore();

  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    const checkAppleAuth = async () => {
      const isAvailable = await isAppleSignInAvailable();
      setAppleAuthAvailable(isAvailable);
    };

    checkAppleAuth();
  }, []);

  const handleSignup = async () => {
    await createAccount(email, password, username);
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView>
      <KeyboardAvoidingView className="flex items-center justify-between h-screen-safe ">
        <View className="mt-32">
          <Text className="font-extrabold text-5xl">Cabulator</Text>
        </View>

        <View className="mb-32">
          <Pressable className="w-[256] bg-blue-700 p-4 rounded-lg mt-4">
            <Text className="text-white text-center font-bold">
              Create Account
            </Text>
          </Pressable>
          <Pressable className="w-[256] bg-indigo-700 p-4 rounded-lg mt-4 mb-4">
            <Text className="text-white text-center font-bold">Login</Text>
          </Pressable>

          {appleAuthAvailable && (
            <View>
              {isLoadingAppleAuth ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
                  }
                  buttonStyle={
                    AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  style={{ width: 256, height: 44 }}
                  cornerRadius={5}
                  onPress={appleSignIn}
                />
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
