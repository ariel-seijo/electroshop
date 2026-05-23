import { SessionOptions } from "iron-session";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is not set. " +
    "Generate one with: openssl rand -base64 32"
  );
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
}

export const sessionOptions: SessionOptions = {
  password: SESSION_SECRET,
  cookieName: "ecommerce-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};
