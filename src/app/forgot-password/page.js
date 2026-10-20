import PasswordRecoveryForm from "@/components/password-recovery-form";
import {
  isAuthConfigured,
  isPasswordResetConfigured,
} from "@/lib/auth";

export const metadata = {
  title: "পাসওয়ার্ড রিসেট",
};

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
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

  return <PasswordRecoveryForm />;
}
