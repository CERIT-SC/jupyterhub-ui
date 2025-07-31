import { randomBytes } from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";

import { SessionData, getSessionOptions } from "../lib";

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  session.state = randomBytes(32).toString("hex");
  await session.save();

  const url = new URL(
    `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/api/oauth2/authorize`,
  );

  url.searchParams.set(
    "client_id",
    `${process.env.NEXT_PUBLIC_JUPYTERHUB_CLIENT_ID}`,
  );
  url.searchParams.set(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", session.state);

  return NextResponse.redirect(url);
}
