# Bangla News 24

Next.js App Router দিয়ে তৈরি বাংলা নিউজ ওয়েব অ্যাপ। খবরের তথ্য নেওয়া হয়
[news-api-v2](https://news-api-v2.vercel.app/) API থেকে।

## চালানো

```bash
npm install
npm run dev
```

লোকাল সাইট দেখতে `http://localhost:3000` খুলুন।

## অ্যাপের পেজ

- `/` — হোমপেজ, সর্বশেষ খবর, API-র কিউরেট করা সেকশন এবং সর্বাধিক পঠিত খবর
- `/category/world` — ক্যাটাগরি ও পৃষ্ঠা অনুযায়ী খবর
- `/news/{id}` — পূর্ণ খবর, প্রকাশের তথ্য ও সূত্র
- `/popular` — সর্বাধিক পঠিত খবর
- `/signin` ও `/signup` — ইমেইল/পাসওয়ার্ড এবং কনফিগার করা Google/GitHub/Discord login
- `/profile` — লগ-ইন করা ব্যবহারকারীর প্রোফাইল; নাম ও ছবি সম্পাদনা
- `/forgot-password` ও `/reset-password` — Resend দিয়ে পাসওয়ার্ড রিসেট

## ব্যবহৃত API

- `/api/categories`
- `/api/news`
- `/api/news/sections`
- `/api/news/most-read`
- `/api/category/{slug}`
- `/api/article/{id}`

API response পাঁচ মিনিটের জন্য revalidate হয়। API অনুপলব্ধ থাকলে সাইট retry করার বার্তা দেখায়।

## Authentication সেটআপ

1. MongoDB Atlas-এ একটি database তৈরি করে connection string নিন।
2. প্রজেক্টের root folder-এ `.env.local` তৈরি করুন (`Copy-Item .env.example .env.local`), তারপর সেখানে `MONGODB_URL` (বা `BETTER_AUTH_DB_URL`/`BETTER_Auth_DB_URL`) ও অন্তত ৩২ অক্ষরের `BETTER_AUTH_SECRET` বসান। Secret বানাতে `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` চালাতে পারেন। `.env.example` নিজে থেকে load হয় না; `.env.local`-এ values যোগ করার পর dev server বন্ধ করে আবার চালান।
3. Local development-এ `BETTER_AUTH_URL` ও `BETTER_AUTH_TRUSTED_ORIGINS`-এ `http://localhost:3000` দিন। Vercel deploy-এর জন্য Project → Settings → Environment Variables-এ `MONGODB_URL`, `MONGODB_DATABASE` (`bangla-news-24`), `BETTER_AUTH_SECRET` (৩২+ অক্ষর), এবং পূর্ণ `https://` URL-সহ `BETTER_AUTH_URL` ও `BETTER_AUTH_TRUSTED_ORIGINS` যোগ করুন। Production domain-টি দুই URL variable-এই দিন; Environment-এ Production (Preview deployment test করলে Preview-ও) নির্বাচন করে নতুন deployment করুন। Client auth origin browser URL থেকে নেয়, তাই `NEXT_PUBLIC_BETTER_AUTH_URL` সেট করার দরকার নেই। Server-side Better Auth-এ ভুল `BETTER_AUTH_URL` থাকলে Vercel deployment URL ব্যবহার হবে; তারপরও environment variable-এ সঠিক URL রাখুন। `.env.local` Vercel-এ upload হয় না এবং Git-এ ignore করা হয়। MongoDB Atlas Network Access-এ Vercel connection অনুমোদিত থাকতে হবে।
4. Google/GitHub/Discord sign-in চালু করতে সংশ্লিষ্ট developer console-এ OAuth app তৈরি করে Client ID/Secret দিন। Callback URL হবে `{BETTER_AUTH_URL}/api/auth/callback/{provider}`; OAuth app-এর callback-ও production domain-এ সেট করুন।
5. `RESEND_API_KEY` ও যাচাইকৃত sender address `RESEND_FROM_EMAIL` দিলে password reset email চালু হবে। Resend-এর test sender সাধারণত কেবল নিজের verified recipient-এ email পাঠাতে পারে; production-এর জন্য sender domain verify করুন। Email verification চাইলে `AUTH_REQUIRE_EMAIL_VERIFICATION=true` দিন এবং verified sender ব্যবহার করুন; এটি default-এ বন্ধ, যাতে test sender signup আটকে না দেয়।

News ticker shared root layout-এ থাকে, তাই সব route-এ দেখা যায়; headline API পাঁচ মিনিট পরপর refresh হয়। `/profile` route proxy-তে cookie আছে কি না দ্রুত যাচাই করে, তারপর server-side-এ প্রকৃত session যাচাই করা হয়। শুধু proxy cookie check-কে authorization হিসেবে ব্যবহার করা হয় না।

Better Auth-এর email/password account `MONGODB_DATABASE`-এ (default `bangla-news-24`) সংরক্ষিত হয়। MongoDB Atlas → Cluster → Browse Collections-এ গিয়ে ওই database-এর `user` collection-এ profile এবং `account` collection-এ login account দেখুন। Local ও Vercel-এ একই Atlas cluster এবং database ব্যবহার করলে একই collection-এ account থাকবে; Vercel API `503` দিলে সেখানে account তৈরি হয়নি। Vercel-এ signup কাজ করার পরও record না দেখলে দুই environment-এর `MONGODB_URL` ও `MONGODB_DATABASE` একই কিনা যাচাই করুন।

## যাচাই ও ডেপ্লয়

```bash
npm run lint
npm run build
```

Vercel-এ repository import করে deploy করুন। Authentication-এর জন্য MongoDB URL ও Better Auth secret প্রয়োজন; OAuth ও Resend ঐচ্ছিক।
