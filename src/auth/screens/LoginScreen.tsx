import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { Button, View, Text, StyleSheet } from "react-native";
import { EmailPasswordForm } from "../forms/EmailPasswordForm";
import { useAuth } from "../auth.hook";
import type { SignInCredentials } from "../auth.types";

export const LoginScreen = () => {
  const { loginWithSocial, loginWithEmailPassword } = useAuth();

  const onAuth = useCallback(async () => {}, []);

  const handleGoogleAuth = useCallback(async () => {
    await loginWithSocial("google", {
      issuer: "https://accounts.google.com",
      clientId:
        "1060725074195-c7mgk8p0h27c4428prfuo3lg7ould5o7.apps.googleusercontent.com",
      redirectUrl: "com.demoapp:/oauthredirect",
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    });
  }, [loginWithSocial, onAuth]);

  const handleEmailPasswordSubmit = useCallback(
    async (values: SignInCredentials) => {
      try {
        await loginWithEmailPassword(values);
      } catch (e) {
        console.warn(e);
      }
    },
    [loginWithEmailPassword, onAuth]
  );

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />

      <View>
        <Button title={"Login with Google"} onPress={handleGoogleAuth} />
      </View>

      <EmailPasswordForm onSubmit={handleEmailPasswordSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
