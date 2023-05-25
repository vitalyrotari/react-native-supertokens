import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SuperTokens from "supertokens-react-native";
import axios, { AxiosInstance } from "axios";
import { APP_API_URL } from "./src/common/constants";

import { DashboardScreen } from "./src/dashboard/screens/DashboardScreen";
import { LoginScreen } from "./src/auth/screens/LoginScreen";

import { AuthProvider } from "./src/auth";

SuperTokens.addAxiosInterceptors(axios);

SuperTokens.init({
  apiDomain: APP_API_URL,
  apiBasePath: "/auth",
  sessionExpiredStatusCode: 440,
});

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

class AuthService {
  private readonly $http: AxiosInstance;

  constructor() {
    this.$http = axios.create({
      baseURL: `${APP_API_URL}/auth`,
      timeout: 1000,
    });
  }

  init() {
    SuperTokens.init({
      apiDomain: APP_API_URL,
      apiBasePath: "/auth",
      sessionExpiredStatusCode: 440,
    });
  }

  async check(): Promise<boolean> {
    return SuperTokens.doesSessionExist();
  }

  async sessionVerify() {
    const resp = await this.$http.get(`/`, {
      withCredentials: true,
    });

    if (resp.status === 440) {
      throw new Error("Login Timeout");
    }

    return resp.data !== "rishabh";
  }

  async login() {
    const resp = await axios.post(
      "/login",
      {
        userId: "rishabh",
      },
      {
        withCredentials: true,
      }
    );

    await this.sessionVerify();
  }

  async logout() {
    await this.$http.post("/logout", {
      withCredentials: true,
    });
  }
}

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      {({ isLoggedIn }) => (
        <NavigationContainer onReady={onLayoutRootView}>
          <Stack.Navigator>
            {isLoggedIn ? (
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: "Dashboard" }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="SignIn"
                  component={LoginScreen}
                  options={{ title: "Sign In" }}
                />
                <Stack.Screen
                  name="SignUp"
                  options={{ title: "Sign Up" }}
                  component={LoginScreen}
                  initialParams={{ isSignUp: true }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </AuthProvider>
  );
}
