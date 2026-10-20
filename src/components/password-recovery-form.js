"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function PasswordRecoveryForm({ token }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");
      const result = token
        ? await authClient.resetPassword({ newPassword: password, token })
        : await authClient.requestPasswordReset({
            email,
            redirectTo: `${window.location.origin}/reset-password`,
          });

      if (result.error) {
        setErrorMessage(result.error.message || "অনুরোধটি সম্পন্ন করা যায়নি।");
        return;
      }

      if (token) {
        router.replace("/signin");
        return;
      }

      setMessage(
        "ইমেইল ঠিকানাটি সঠিক হলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।",
      );
    } catch (error) {
      setErrorMessage(error.message || "অনুরোধটি সম্পন্ন করা যায়নি।");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="auth-kicker">Bangla News 24</span>
        <h1>{token ? "নতুন পাসওয়ার্ড দিন" : "পাসওয়ার্ড রিসেট"}</h1>
        <p className="auth-description">
          {token
            ? "নতুন পাসওয়ার্ডটি অন্তত ৮ অক্ষরের হতে হবে।"
            : "আপনার অ্যাকাউন্টের ইমেইল দিন; রিসেট লিংক পাঠানো হবে।"}
        </p>
        {token ? (
          <form className="auth-form" onSubmit={submit}>
            <label>
              নতুন পাসওয়ার্ড
              <input
                autoComplete="new-password"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </label>
            {errorMessage ? (
              <p className="auth-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <button className="auth-submit" disabled={isPending} type="submit">
              {isPending ? "সংরক্ষণ হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>
              ইমেইল
              <input
                autoComplete="email"
                name="email"
                required
                type="email"
              />
            </label>
            {errorMessage ? (
              <p className="auth-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
            {message ? (
              <p className="auth-success" role="status">
                {message}
              </p>
            ) : null}
            <button className="auth-submit" disabled={isPending} type="submit">
              {isPending ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
            </button>
          </form>
        )}
        <p className="auth-switch">
          <Link href="/signin">সাইন ইন পাতায় ফিরে যান</Link>
        </p>
      </section>
    </main>
  );
}
