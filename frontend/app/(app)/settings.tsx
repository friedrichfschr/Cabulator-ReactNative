import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import React, { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../../store/authstore";

type Props = {};

const SettingsScreen = (props: Props) => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Success", "You have been logged out successfully");
    } catch (error) {
      console.log("Error logging out:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingsContainer}>
        {/* Other settings options would go here */}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
  },
  settingsContainer: {
    marginTop: 20,
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
