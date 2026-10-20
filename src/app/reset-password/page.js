import PasswordRecoveryForm from "@/components/password-recovery-form";
import {
  isAuthConfigured,
  isPasswordResetConfigured,
} from "@/lib/auth";

export const metadata = {
  title: "নতুন পাসওয়ার্ড",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;

  if (!isAuthConfigured() || !isPasswordResetConfigured()) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>পাসওয়ার্ড রিসেট</h1>
          <p className="auth-error" role="status">
            পাসওয়ার্ড রিসেট চালু করতে MongoDB, Resend API key এবং sender email
            কনফিগার করুন।
          </p>
        </section>
      </main>
    );
  }

  return <PasswordRecoveryForm token={token} />;
}
