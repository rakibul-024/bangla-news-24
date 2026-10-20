import AuthForm from "@/components/auth-form";
import {
  getConfiguredSocialProviders,
  isAuthConfigured,
  isEmailVerificationConfigured,
} from "@/lib/auth";

function getSafeCallbackURL(value) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }

  return "/";
}

export const metadata = {
  title: "সাইন ইন",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;

  return (
    <AuthForm
      callbackURL={getSafeCallbackURL(params.callbackURL)}
      backendConfigured={isAuthConfigured()}
      mode="signin"
      providers={getConfiguredSocialProviders()}
      verificationRequired={isEmailVerificationConfigured()}
    />
  );
}
