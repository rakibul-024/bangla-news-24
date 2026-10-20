import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">৪০৪</span>
      <h1>খবরটি খুঁজে পাওয়া যায়নি</h1>
      <p>লিংকটি ভুল হতে পারে, অথবা খবরটি সরিয়ে নেওয়া হয়েছে।</p>
      <Link className="button-link" href="/">
        প্রচ্ছদে ফিরে যান
      </Link>
    </main>
  );
}
