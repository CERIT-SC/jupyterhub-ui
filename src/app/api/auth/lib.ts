import { SessionOptions } from "iron-session";

export interface SessionData {
  state: string;
}

export const getSessionOptions = () => {
  const sessionSecret = process.env.SESSION_SECRET

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET is not set");
  }

  const sessionOptions: SessionOptions = {
    password: sessionSecret,
    cookieName: "oauth-session",
    ttl: 15 * 60, // 15 minutes
    cookieOptions: {
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    },
  };

  return sessionOptions;
} 
