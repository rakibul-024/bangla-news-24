import AuthForm from "@/components/auth-form";
import {
  getConfiguredSocialProviders,
  isAuthConfigured,
  isEmailVerificationConfigured,
} from "@/lib/auth";

export const metadata = {
  title: "সাইন আপ",
};

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <AuthForm
      callbackURL="/profile"
      backendConfigured={isAuthConfigured()}
      mode="signup"
      providers={getConfiguredSocialProviders()}
      verificationRequired={isEmailVerificationConfigured()}
    />
  );
}
