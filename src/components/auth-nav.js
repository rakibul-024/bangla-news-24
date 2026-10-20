"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

function SignInLinks() {
  return (
    <div className="auth-nav">
      <Link className="auth-nav-signin" href="/signin">
        সাইন ইন
      </Link>
      <Link className="auth-nav-signup" href="/signup">
        সাইন আপ
      </Link>
    </div>
  );
}

function SessionAuthNav() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const { data: session, isPending } = authClient.useSession();

  async function signOut() {
    setErrorMessage("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setErrorMessage(error.message || "সাইন আউট করা যায়নি।");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error.message || "সাইন আউট করা যায়নি।");
    }
  }

  if (isPending) {
    return <div className="auth-nav auth-nav-loading" aria-label="লোড হচ্ছে" />;
  }

  if (session?.user) {
    return (
      <>
        <div className="auth-nav">
          <Link className="auth-nav-profile" href="/profile">
            {session.user.name || "প্রোফাইল"}
          </Link>
          <button className="auth-nav-signout" onClick={signOut} type="button">
            সাইন আউট
          </button>
        </div>
        {errorMessage ? (
          <span className="auth-nav-error" role="alert">
            {errorMessage}
          </span>
        ) : null}
      </>
    );
  }

  return <SignInLinks />;
}

export default function AuthNav({ enabled }) {
  return enabled ? <SessionAuthNav /> : <SignInLinks />;
}
