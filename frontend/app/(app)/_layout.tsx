import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#101010",
        },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="chat"
              size={24}
              color={focused ? "#fff" : "#666"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="settings"
              size={24}
              color={focused ? "#fff" : "#666"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
