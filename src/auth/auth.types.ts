export type ClaimValidatoinResult =
  | { isValid: true }
  | { isValid: false; reason: { message: string; [k: string]: unknown } };

export interface ClaimValidator {
  readonly id: string;
  refresh(): Promise<void>;
  shouldRefresh(accessTokenPayload: unknown): boolean | Promise<boolean>;
  validate(
    payload: unknown
  ): ClaimValidatoinResult | Promise<ClaimValidatoinResult>;
}

export type SessionClaim<TValue> = {
  refresh(): Promise<void>;
  getValueFromPayload(payload: unknown): TValue | undefined;
  getLastFetchedTime(payload: unknown): number | undefined;
};

export type RecipeFunctionOptions = {
  preAPIHook?: (input: {
    url: string;
    requestInit: RequestInit;
  }) => Promise<{ url: string; requestInit: RequestInit }>;
};

export interface IEmailVerificationRecipe {
  /**
   * Verify an email
   *
   * @param userContext Refer to {@link https://supertokens.com/docs/emailpassword/advanced-customizations/user-context the documentation}
   *
   * @param options Use this to configure additional properties (for example pre api hooks)
   *
   * @returns `{status: "OK"}` if successfull
   * @returns `{status: "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR"}` if token is invalid
   *
   * @throws STGeneralError if the API exposed by the backend SDKs returns `status: "GENERAL_ERROR"`
   */
  verifyEmail: (input: {
    options?: RecipeFunctionOptions;
  }) => Promise<{
    status: "OK" | "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR";
    fetchResponse: Response;
  }>;

  /**
   * Send an email to the user for verification.
   *
   * @param userContext Refer to {@link https://supertokens.com/docs/emailpassword/advanced-customizations/user-context the documentation}
   *
   * @param options Use this to configure additional properties (for example pre api hooks)
   *
   * @returns `{status: "OK"}` if successfull
   * @returns `{status: "EMAIL_ALREADY_VERIFIED_ERROR"}` if the email has already been verified
   *
   * @throws STGeneralError if the API exposed by the backend SDKs returns `status: "GENERAL_ERROR"`
   */
  sendVerificationEmail: (input: {
    options?: RecipeFunctionOptions;
  }) => Promise<{
    status: "EMAIL_ALREADY_VERIFIED_ERROR" | "OK";
    fetchResponse: Response;
  }>;

  /**
   * Check if an email has been verified
   *
   * @param userContext Refer to {@link https://supertokens.com/docs/emailpassword/advanced-customizations/user-context the documentation}
   *
   * @param options Use this to configure additional properties (for example pre api hooks)
   *
   * @returns `{status: "OK", isVerified: boolean}`
   *
   * @throws STGeneralError if the API exposed by the backend SDKs returns `status: "GENERAL_ERROR"`
   */
  isEmailVerified: (input: {
    options?: RecipeFunctionOptions;
  }) => Promise<{
    status: "OK";
    isVerified: boolean;
    fetchResponse: Response;
  }>;

  /**
   * Reads and returns the email verification token from the current URL
   *
   * @param userContext Refer to {@link https://supertokens.com/docs/emailpassword/advanced-customizations/user-context the documentation}
   *
   * @returns The "token" query parameter from the current location
   */
  getEmailVerificationTokenFromURL: (input: { userContext: any }) => string;
}

export interface AuthState {
  isReady: boolean;
  isLoggedIn: boolean;
  user: null | (SignInUser & { thirdParty?: SignInUserThirdParty });
}

export type ThirdPartySocialId = "google";

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignInUser = {
  id: string;
  email: string;
  timeJoined: number;
};

export type SignInUserThirdParty = {
  id: string;
  userId: string;
};

export type SignInResponse = {
  status: string;
  user: SignInUser;
};

export type SignInUpResponse = {
  status: string;
  user: SignInUser & { thirdParty: SignInUserThirdParty };
  createdNewUser: boolean;
};
