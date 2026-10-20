"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function UserProfile({ user }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function updateProfile(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const image = String(formData.get("image") || "").trim();

      if (image && !["http:", "https:"].includes(new URL(image).protocol)) {
        setErrorMessage("ছবির লিংক http বা https দিয়ে শুরু হতে হবে।");
        return;
      }

      const { error } = await authClient.updateUser({
        name: String(formData.get("name") || "").trim(),
        image: image || null,
      });

      if (error) {
        setErrorMessage(error.message || "প্রোফাইল আপডেট করা যায়নি।");
        return;
      }

      setSuccessMessage("প্রোফাইল আপডেট হয়েছে।");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error.message || "প্রোফাইল আপডেট করা যায়নি।");
    } finally {
      setIsPending(false);
    }
  }

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

  return (
    <section className="profile-card">
      <div className="profile-avatar" aria-hidden="true">
        {user.image ? (
          <Image
            alt=""
            height={96}
            src={user.image}
            unoptimized
            width={96}
          />
        ) : (
          <span>{user.name?.trim().charAt(0) || "প"}</span>
        )}
      </div>
      <span className="auth-kicker">আপনার অ্যাকাউন্ট</span>
      <h1>{user.name || "পাঠক"}</h1>
      <p className="profile-email">{user.email}</p>

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

      {isEditing ? (
        <form className="auth-form profile-form" onSubmit={updateProfile}>
          <label>
            নাম
            <input
              autoComplete="name"
              defaultValue={user.name || ""}
              maxLength={80}
              name="name"
              required
            />
          </label>
          <label>
            প্রোফাইল ছবির URL (ঐচ্ছিক)
            <input
              defaultValue={user.image || ""}
              name="image"
              placeholder="https://example.com/photo.jpg"
              type="url"
            />
          </label>
          <div className="profile-actions">
            <button className="auth-submit" disabled={isPending} type="submit">
              {isPending ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ"}
            </button>
            <button
              className="auth-secondary"
              onClick={() => setIsEditing(false)}
              type="button"
            >
              বাতিল
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-actions">
          <button
            className="auth-submit"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            প্রোফাইল সম্পাদনা
          </button>
          <button className="auth-secondary" onClick={signOut} type="button">
            সাইন আউট
          </button>
        </div>
      )}
    </section>
  );
}
