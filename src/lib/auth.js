import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { Resend } from "resend";

let mongoClient;
let authInstance;
let resendClient;
let invalidAuthURLWarningLogged = false;

function getEnvironmentValue(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  return undefined;
}

function getEmailConfiguration() {
  const apiKey = getEnvironmentValue("RESEND_API_KEY");
  const fromEmail = getEnvironmentValue("RESEND_FROM_EMAIL");
  return apiKey && fromEmail ? { apiKey, fromEmail } : null;
}

function getHttpOrigin(value) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
  } catch {}

  return undefined;
}

function getDeploymentOrigin(hostname) {
  if (!hostname) return undefined;
  return getHttpOrigin(
    hostname.startsWith("http") ? hostname : `https://${hostname}`,
  );
}

function getAuthBaseURL() {
  const configuredValue = getEnvironmentValue("BETTER_AUTH_URL");
  const configuredURL = getHttpOrigin(configuredValue);
  const deploymentURL = getDeploymentOrigin(
    getEnvironmentValue("VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"),
  );
  const configuredHost = configuredURL ? new URL(configuredURL).hostname : "";
  const isLocalURL = ["localhost", "127.0.0.1", "[::1]"].includes(
    configuredHost,
  );

  if (configuredValue && !configuredURL) {
    if (!invalidAuthURLWarningLogged) {
      console.error(
        "BETTER_AUTH_URL must be a complete http:// or https:// URL. Falling back to the deployment URL when available.",
      );
      invalidAuthURLWarningLogged = true;
    }
  }

  if (process.env.NODE_ENV === "production" && isLocalURL) {
    if (deploymentURL) return deploymentURL;
    throw new Error(
      "BETTER_AUTH_URL points to localhost in production, and no Vercel deployment URL is available.",
    );
  }

  const baseURL = configuredURL || deploymentURL;
  if (!baseURL && process.env.NODE_ENV === "production") {
    throw new Error(
      "Set BETTER_AUTH_URL to a valid HTTPS URL or configure the Vercel deployment URL.",
    );
  }

  return baseURL;
}

function getTrustedOrigins() {
  const configuredOriginValues = (
    getEnvironmentValue("BETTER_AUTH_TRUSTED_ORIGINS") || ""
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const configuredOrigins = configuredOriginValues
    .map(getHttpOrigin)
    .filter(Boolean);

  if (configuredOrigins.length !== configuredOriginValues.length) {
    console.error(
      "Ignoring invalid entries in BETTER_AUTH_TRUSTED_ORIGINS; use complete http:// or https:// origins.",
    );
  }

  const deploymentOrigins = [
    getEnvironmentValue("VERCEL_PROJECT_PRODUCTION_URL"),
    getEnvironmentValue("VERCEL_URL"),
  ]
    .map(getDeploymentOrigin)
    .filter(Boolean);
  const authBaseURL =
    getAuthBaseURL() ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined);
  const origins = [
    ...configuredOrigins,
    ...deploymentOrigins,
    ...(authBaseURL ? [authBaseURL] : []),
  ];

  const trustedOrigins = [
    ...new Set(
      origins
        .map((origin) => new URL(origin).origin)
        .filter(
          (origin) =>
            process.env.NODE_ENV !== "production" ||
            !["localhost", "127.0.0.1", "[::1]"].includes(
              new URL(origin).hostname,
            ),
        ),
    ),
  ];

  return trustedOrigins.length ? trustedOrigins : undefined;
}

function isEmailVerificationRequired() {
  return (
    Boolean(getEmailConfiguration()) &&
    getEnvironmentValue("AUTH_REQUIRE_EMAIL_VERIFICATION")?.toLowerCase() ===
      "true"
  );
}

export function isAuthConfigured() {
  const secret = getEnvironmentValue("BETTER_AUTH_SECRET");

  return Boolean(
    getEnvironmentValue(
      "MONGODB_URL",
      "BETTER_AUTH_DB_URL",
      "BETTER_Auth_DB_URL",
    ) &&
      secret &&
      secret.length >= 32,
  );
}

export function isEmailVerificationConfigured() {
  return isEmailVerificationRequired();
}

export function isPasswordResetConfigured() {
  return Boolean(getEmailConfiguration());
}

export function getConfiguredSocialProviders() {
  const providers = [];

  if (
    getEnvironmentValue(
      "GOOGLE_CLIENT_ID",
      "BETTER_AUTH_GOOGLE_CLIENT_ID",
      "BETTER_AUTH_GEOGLE_CLIENT_ID",
    ) &&
    getEnvironmentValue(
      "GOOGLE_CLIENT_SECRET",
      "BETTER_AUTH_GOOGLE_CLIENT_SECRET",
      "BETTER_AUTH_GEOGLE_SECRET",
    )
  ) {
    providers.push("google");
  }

  if (
    getEnvironmentValue("GITHUB_CLIENT_ID", "BETTER_AUTH_GITHUB_CLIENT_ID") &&
    getEnvironmentValue("GITHUB_CLIENT_SECRET", "BETTER_AUTH_GITHUB_SECRET")
  ) {
    providers.push("github");
  }

  if (
    getEnvironmentValue(
      "DISCORD_CLIENT_ID",
      "BETTER_AUTH_DISCORD_CLIENT_ID",
    ) &&
    getEnvironmentValue(
      "DISCORD_CLIENT_SECRET",
      "BETTER_AUTH_DISCORD_SECRET",
    )
  ) {
    providers.push("discord");
  }

  return providers;
}

export function getAuth() {
  const mongoUrl = getEnvironmentValue(
    "MONGODB_URL",
    "BETTER_AUTH_DB_URL",
    "BETTER_Auth_DB_URL",
  );
  const secret = getEnvironmentValue("BETTER_AUTH_SECRET");

  if (!mongoUrl) {
    throw new Error("MONGODB_URL is required to use authentication.");
  }

  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
  }

  if (!authInstance) {
    mongoClient ??= new MongoClient(mongoUrl);
    const socialProviders = {};
    const googleClientId = getEnvironmentValue(
      "GOOGLE_CLIENT_ID",
      "BETTER_AUTH_GOOGLE_CLIENT_ID",
      "BETTER_AUTH_GEOGLE_CLIENT_ID",
    );
    const googleClientSecret = getEnvironmentValue(
      "GOOGLE_CLIENT_SECRET",
      "BETTER_AUTH_GOOGLE_CLIENT_SECRET",
      "BETTER_AUTH_GEOGLE_SECRET",
    );
    const githubClientId = getEnvironmentValue(
      "GITHUB_CLIENT_ID",
      "BETTER_AUTH_GITHUB_CLIENT_ID",
    );
    const githubClientSecret = getEnvironmentValue(
      "GITHUB_CLIENT_SECRET",
      "BETTER_AUTH_GITHUB_SECRET",
    );
    const discordClientId = getEnvironmentValue(
      "DISCORD_CLIENT_ID",
      "BETTER_AUTH_DISCORD_CLIENT_ID",
    );
    const discordClientSecret = getEnvironmentValue(
      "DISCORD_CLIENT_SECRET",
      "BETTER_AUTH_DISCORD_SECRET",
    );

    if (googleClientId && googleClientSecret) {
      socialProviders.google = {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      };
    }

    if (githubClientId && githubClientSecret) {
      socialProviders.github = {
        clientId: githubClientId,
        clientSecret: githubClientSecret,
      };
    }

    if (discordClientId && discordClientSecret) {
      socialProviders.discord = {
        clientId: discordClientId,
        clientSecret: discordClientSecret,
      };
    }

    const emailConfiguration = getEmailConfiguration();
    const emailVerification =
      emailConfiguration && isEmailVerificationRequired()
      ? {
          sendOnSignUp: true,
          sendOnSignIn: true,
          autoSignInAfterVerification: true,
          sendVerificationEmail: async ({ user, url }) => {
            resendClient ??= new Resend(emailConfiguration.apiKey);
            const { error } = await resendClient.emails.send({
              from: emailConfiguration.fromEmail,
              to: user.email,
              subject: "ইমেইল ঠিকানা যাচাই করুন | Bangla News 24",
              text: `আপনার ইমেইল ঠিকানা যাচাই করতে এই লিংকটি খুলুন:\n\n${url}`,
            });

            if (error) throw new Error(`Verification email failed: ${error.message}`);
          },
        }
      : undefined;
    const emailAndPassword = {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: isEmailVerificationRequired(),
      ...(emailConfiguration
        ? {
            sendResetPassword: async ({ user, url }) => {
              resendClient ??= new Resend(emailConfiguration.apiKey);
              const { error } = await resendClient.emails.send({
                from: emailConfiguration.fromEmail,
                to: user.email,
                subject: "পাসওয়ার্ড রিসেট | Bangla News 24",
                text: `পাসওয়ার্ড পরিবর্তন করতে এই লিংকটি খুলুন:\n\n${url}`,
              });

              if (error) {
                throw new Error(`Password reset email failed: ${error.message}`);
              }
            },
          }
        : {}),
    };

    authInstance = betterAuth({
      appName: "Bangla News 24",
      baseURL: getAuthBaseURL(),
      secret,
      logger: { disabled: true },
      database: mongodbAdapter(
        mongoClient.db(
          getEnvironmentValue("MONGODB_DATABASE") || "bangla-news-24",
        ),
      ),
      emailVerification,
      emailAndPassword,
      ...(Object.keys(socialProviders).length ? { socialProviders } : {}),
      trustedOrigins: getTrustedOrigins(),
    });
  }

  return authInstance;
}
