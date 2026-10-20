import { getLatestNews } from "@/lib/news";

export async function GET() {
  try {
    const result = await getLatestNews({ limit: 10 });
    return Response.json({ data: result.data });
  } catch (error) {
    console.error("Could not fetch latest news for the ticker.", error);
    return Response.json(
      { error: "সর্বশেষ খবর লোড করা যায়নি।" },
      { status: 502 },
    );
  }
}
