import { createAuthClient } from "better-auth/react";

const baseURL =
  typeof window === "undefined" ? "http://localhost:3000" : window.location.origin;

export const authClient = createAuthClient({ baseURL });

export const {
  signIn,
  signUp,
  signOut,
  updateUser,
  changePassword,
  sendVerificationEmail,
  useSession,
  requestPasswordReset,
  resetPassword,
} = authClient;

/**
 * gign up :register:create account: first time user
 * sing in :login:login user: already registered user
 * sign out :logout
 */
