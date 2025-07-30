import assert from "assert";

import { SessionOptions } from "iron-session";

export interface SessionData {
  state: string;
}

const sessionSecret = process.env.SESSION_SECRET;

assert(sessionSecret, "SESSION_SECRET is not set");

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "oauth-session",
  ttl: 15 * 60, // 15 minutes
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
  },
};
