import axios from "axios";
import SuperTokens from "supertokens-react-native";
import { authorize, AuthConfiguration } from "react-native-app-auth";
import { createContext, useEffect, useMemo, useReducer } from "react";
import { SessionClaimValidatorStore } from "./claims";
import { APP_API_URL } from "../common/constants";

import type { FunctionComponent } from "react";
import type {
  AuthState,
  ThirdPartySocialId,
  SignInCredentials,
  SignInUser,
  SignInUserThirdParty,
  SignInResponse,
  SignInUpResponse,
  ClaimValidator,
  SessionClaim,
} from "./auth.types";

enum AuthActionKind {
  RESTORE_SESSION = "RESTORE_SESSION",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
}

type AuthAction =
  | {
      type: AuthActionKind.RESTORE_SESSION;
      payload: boolean;
    }
  | {
      type: AuthActionKind.SIGN_IN;
      payload: SignInUser & { thirdParty?: SignInUserThirdParty };
    }
  | {
      type: AuthActionKind.SIGN_OUT;
    };

function authReducer(prevState: AuthState, action: AuthAction) {
  switch (action.type) {
    case "RESTORE_SESSION":
      return {
        ...prevState,
        isLoggedIn: action.payload,
        isReady: true,
      };
    case "SIGN_IN":
      return {
        ...prevState,
        isLoggedIn: true,
        user: action.payload,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isLoggedIn: false,
        user: null,
      };
    default:
      return prevState;
  }
}

export const AuthCtx = createContext(null);

export const AuthProvider = ({
  children,
}: {
  children: FunctionComponent<AuthState>;
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    isReady: false,
    isLoggedIn: false,
    user: null,
  });

  const api = useMemo(
    () => ({
      ...state,

      checkForSession: async () => {
        const sessionExists = await SuperTokens.doesSessionExist();

        if (sessionExists) {
          const emailVerificationResp = await api.isEmailVerified();

          console.log("emailVerificationResp", emailVerificationResp);
        }

        dispatch({
          type: AuthActionKind.RESTORE_SESSION,
          payload: sessionExists,
        });
      },

      loginWithEmailPassword: async ({
        email,
        password,
      }: SignInCredentials): Promise<SignInUser> => {
        let resp = await axios.post<SignInResponse>(
          `${APP_API_URL}/auth/signin`,
          {
            formFields: [
              {
                id: "email",
                value: email,
              },
              {
                id: "password",
                value: password,
              },
            ],
          },
          {
            headers: {
              rid: "thirdpartyemailpassword",
            },
          }
        );

        if (resp.data.status !== "OK") {
          throw new Error("Auth failer");
        }

        dispatch({
          type: AuthActionKind.SIGN_IN,
          payload: resp.data.user,
        });

        return resp.data.user;
      },

      loginWithSocial: async (
        thirdPartyId: ThirdPartySocialId,
        config: AuthConfiguration
      ) => {
        const { accessToken, idToken, ...authResult } = await authorize(config);

        const resp = await axios.post<SignInUpResponse>(
          `${APP_API_URL}/auth/signinup`,
          {
            thirdPartyId,
            redirectURI: "com.demoapp:/oauthredirect",
            authCodeResponse: {
              ...authResult,
              access_token: accessToken,
              id_token: idToken,
            },
            clientId: config.clientId,
          },
          {
            headers: {
              rid: "thirdpartyemailpassword",
            },
          }
        );

        if (resp.data.status !== "OK") {
          throw new Error("Google login failed");
        }

        dispatch({
          type: AuthActionKind.SIGN_IN,
          payload: resp.data.user,
        });

        return resp.data.user;
      },

      logout: async () => {
        await SuperTokens.signOut();

        dispatch({
          type: AuthActionKind.SIGN_OUT,
        });
      },

      sendPasswordResetEmail: async ({ email }: { email: string }) => {
        const resp = await axios.post<
          | {
              status: "OK";
            }
          | {
              status: "FIELD_ERROR";
              formFields: {
                id: string;
                error: string;
              }[];
            }
        >(
          `${APP_API_URL}/auth/user/password/reset/token`,
          {
            forFields: [
              {
                id: "email",
                value: email,
              },
            ],
          },
          {
            headers: {
              rid: "thirdpartyemailpassword",
            },
          }
        );

        return resp.data;
      },

      submitNewPassword: async ({
        token,
        newPassword,
      }: {
        token: string;
        newPassword: string;
      }) => {
        const resp = await axios.post<
          | {
              status: "OK" | "RESET_PASSWORD_INVALID_TOKEN_ERROR";
            }
          | {
              status: "FIELD_ERROR";
              formFields: {
                id: string;
                error: string;
              }[];
            }
        >(
          `${APP_API_URL}/auth/user/password/reset`,
          {
            method: "token",
            forFields: [
              {
                id: "password",
                value: newPassword,
              },
            ],
            token,
          },
          {
            headers: {
              rid: "thirdpartyemailpassword",
            },
          }
        );

        return resp.data;
      },

      verifyEmail: async ({ token }: { token: string }) => {
        const resp = await axios.post<{
          status: "OK" | "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR";
        }>(
          `${APP_API_URL}/auth/user/email/verify`,
          {
            method: "token",
            token,
          },
          {
            headers: {
              rid: "emailverification",
            },
          }
        );

        return resp.data;
      },

      sendVerificationEmail: async () => {
        const resp = await axios.post<{
          status: "OK" | "EMAIL_ALREADY_VERIFIED";
        }>(
          `${APP_API_URL}/auth/user/email/verify/token`,
          {},
          {
            withCredentials: true,
            headers: {
              rid: "emailverification",
            },
          }
        );

        return resp.data;
      },

      isEmailVerified: async () => {
        const resp = await axios.get<{
          status: "OK";
          isVerified: boolean;
        }>(`${APP_API_URL}/auth/user/email/verify`, {
          withCredentials: true,
          headers: {
            rid: "emailverification",
          },
        });

        return resp.data;
      },
    }),
    [state]
  );

  useEffect(() => {
    if (!api.isReady) {
      api.checkForSession().catch(console.warn);
    }
  }, [api]);

  return (
    <AuthCtx.Provider value={api}>
      {state.isReady ? children(state) : null}
    </AuthCtx.Provider>
  );
};
