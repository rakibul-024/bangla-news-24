import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth";

export const runtime = "nodejs";

function getAuthHandler(method) {
  return async (request) => {
    if (!isAuthConfigured()) {
      return Response.json(
        {
          error: process.env.VERCEL
            ? "Authentication is not configured. Add MONGODB_URL and BETTER_AUTH_SECRET under Vercel Project Settings > Environment Variables, then redeploy."
            : "Authentication is not configured. Set MONGODB_URL and BETTER_AUTH_SECRET in .env.local, then restart the dev server.",
        },
        { status: 503 },
      );
    }

    return toNextJsHandler(getAuth())[method](request);
  };
}

export const GET = getAuthHandler("GET");
export const POST = getAuthHandler("POST");
