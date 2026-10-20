import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

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
