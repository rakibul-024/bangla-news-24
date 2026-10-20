"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

function getErrorMessage(error) {
  return error?.message || "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
}

export default function AuthForm({
  mode,
  providers = [],
  callbackURL = "/",
  backendConfigured = true,
  isVercelDeployment = false,
  verificationRequired = false,
}) {
  const router = useRouter();
  const isSignUp = mode === "signup";
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");

      const result = isSignUp
        ? await authClient.signUp.email({
            name: String(formData.get("name") || ""),
            email,
            password,
            callbackURL,
          })
        : await authClient.signIn.email({ email, password, callbackURL });

      if (result.error) {
        setErrorMessage(getErrorMessage(result.error));
        return;
      }

      if (isSignUp && verificationRequired) {
        setSuccessMessage(
          "আপনার ইমেইলে যাচাইকরণ লিংক পাঠানো হয়েছে। ইনবক্স দেখে ইমেইল যাচাই করুন।",
        );
        return;
      }

      router.replace(callbackURL);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  async function handleSocialSignIn(provider) {
    setErrorMessage("");
    setIsPending(true);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
      });

      if (error) setErrorMessage(getErrorMessage(error));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="auth-kicker">Bangla News 24</span>
        <h1>{isSignUp ? "নতুন অ্যাকাউন্ট খুলুন" : "আপনার অ্যাকাউন্টে সাইন ইন করুন"}</h1>
        <p className="auth-description">
          {isSignUp
            ? "আপনার নাম ও ইমেইল দিয়ে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।"
            : "আপনার খবর পড়ার অভিজ্ঞতা চালিয়ে যেতে সাইন ইন করুন।"}
        </p>

        {!backendConfigured ? (
          <p className="auth-error" role="status">
            {isVercelDeployment ? (
              <>
                Vercel-এ signup চালু করতে Project → Settings → Environment
                Variables-এ `MONGODB_URL` (MongoDB Atlas connection string) এবং
                অন্তত ৩২ অক্ষরের `BETTER_AUTH_SECRET` যোগ করুন। এই site-এর
                `BETTER_AUTH_URL` ও `BETTER_AUTH_TRUSTED_ORIGINS`-এ
                `https://bangla-news-24-ruby.vercel.app` দিন, তারপর Production
                deployment redeploy করুন। MongoDB Atlas-এ Vercel server-এর
                connection অনুমোদিত থাকতে হবে।
              </>
            ) : (
              <>
                প্রজেক্টের root folder-এ `.env.local` ফাইলে `MONGODB_URL` এবং
                অন্তত ৩২ অক্ষরের `BETTER_AUTH_SECRET` সেট করে dev server বন্ধ
                করে আবার চালু করুন। Google, GitHub ও Discord login ঐচ্ছিক।
              </>
            )}
          </p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp ? (
              <label>
                নাম
                <input
                  autoComplete="name"
                  maxLength={80}
                  name="name"
                  placeholder="আপনার নাম"
                  required
                />
              </label>
            ) : null}
            <label>
              ইমেইল
              <input
                autoComplete="email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </label>
            <label>
              পাসওয়ার্ড
              <input
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                name="password"
                placeholder={isSignUp ? "কমপক্ষে ৮ অক্ষর" : "আপনার পাসওয়ার্ড"}
                required
                type="password"
              />
            </label>
            {errorMessage ? (
              <p className="auth-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
            {successMessage ? (
              <p className="auth-success" role="status">
                {successMessage}
              </p>
            ) : null}
            <button className="auth-submit" disabled={isPending} type="submit">
              {isPending
                ? "অপেক্ষা করুন..."
                : isSignUp
                  ? "অ্যাকাউন্ট তৈরি করুন"
                  : "সাইন ইন"}
            </button>
          </form>
        )}

        {backendConfigured && !isSignUp ? (
          <Link className="auth-forgot-link" href="/forgot-password">
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        ) : null}

        {backendConfigured && providers.length ? (
          <>
            <div className="auth-divider">
              <span>অথবা</span>
            </div>
            <div className="social-auth">
              {providers.includes("google") ? (
                <button
                  disabled={isPending}
                  onClick={() => handleSocialSignIn("google")}
                  type="button"
                >
                  Google দিয়ে চালিয়ে যান
                </button>
              ) : null}
              {providers.includes("github") ? (
                <button
                  disabled={isPending}
                  onClick={() => handleSocialSignIn("github")}
                  type="button"
                >
                  GitHub দিয়ে চালিয়ে যান
                </button>
              ) : null}
              {providers.includes("discord") ? (
                <button
                  disabled={isPending}
                  onClick={() => handleSocialSignIn("discord")}
                  type="button"
                >
                  Discord দিয়ে চালিয়ে যান
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        <p className="auth-switch">
          {isSignUp ? "আগে থেকেই অ্যাকাউন্ট আছে?" : "নতুন পাঠক?"}{" "}
          <Link href={isSignUp ? "/signin" : "/signup"}>
            {isSignUp ? "সাইন ইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </Link>
        </p>
      </section>
    </main>
  );
}
