import { useContext } from "react";
import { AuthCtx } from "./auth.provider";

export const useAuth = () => {
  const ctx = useContext(AuthCtx);

  if (!ctx) {
    throw new Error("useAuth must be used within the AuthProvider");
  }

  return ctx;
};
