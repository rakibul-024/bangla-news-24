import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth";

export const runtime = "nodejs";

function getAuthHandler(method) {
  return async (request) => {
    if (!isAuthConfigured()) {
      return Response.json(
        {
          error:
            "Authentication is not configured. Set MONGODB_URL and BETTER_AUTH_SECRET in .env.local.",
        },
        { status: 503 },
      );
    }

    return toNextJsHandler(getAuth())[method](request);
  };
}

export const GET = getAuthHandler("GET");
export const POST = getAuthHandler("POST");
