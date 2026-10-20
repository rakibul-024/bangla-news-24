"use client";

export default function ErrorPage({ reset }) {
  return (
    <main className="error-page">
      <span className="eyebrow">সংযোগ সমস্যা</span>
      <h1>খবর লোড করা যাচ্ছে না</h1>
      <p>নিউজ সার্ভারে সাময়িক সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
      <button onClick={() => reset()} type="button">
        আবার চেষ্টা করুন
      </button>
    </main>
  );
}
