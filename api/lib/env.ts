import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID") || "dev-app-id",
  appSecret: required("APP_SECRET") || "dev-fallback-secret-min-32-chars-long!!!",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL") || (!process.env.NODE_ENV || process.env.NODE_ENV === "development" ? "mysql://root@localhost:3306/homyhomegrow" : ""),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  // SMTP Config for newsletter emails (optional - emails stored even without SMTP)
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "newsletter@homyhomegrow.de",
  },
};
