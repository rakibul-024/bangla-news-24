import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserProfile from "@/components/user-profile";
import { getAuth } from "@/lib/auth";

export const metadata = {
  title: "আমার প্রোফাইল",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/signin?callbackURL=%2Fprofile");

  return (
    <main className="page-container profile-page">
      <UserProfile user={session.user} />
    </main>
  );
}
