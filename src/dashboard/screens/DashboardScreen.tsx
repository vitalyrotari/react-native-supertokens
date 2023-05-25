import { } from 'react';

import { Button, SafeAreaView, View, Text } from "react-native";

import { useAuth } from "../../auth";

export const DashboardScreen = () => {
  const { logout } = useAuth();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ marginBottom: 32 }}>Logged in Succesfully</Text>
        <Button title="Sign out" onPress={logout} />
      </View>
    </SafeAreaView>
  );
};
