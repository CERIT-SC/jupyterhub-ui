import { randomBytes } from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";

import { SessionData, getSessionOptions } from "../lib";

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  session.state = randomBytes(32).toString("hex");
  await session.save();

  // Derive origin from request (supports proxies)
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const origin = host ? `${proto}://${host}` : new URL(req.url).origin;

  const hubBase = process.env.NEXT_PUBLIC_JUPYTERHUB_URL;
  if (!hubBase) {
    return new NextResponse("Missing NEXT_PUBLIC_JUPYTERHUB_URL", { status: 500 });
  }

  const url = new URL(`${hubBase}/hub/api/oauth2/authorize`);

  url.searchParams.set(
    "client_id",
    `${process.env.NEXT_PUBLIC_JUPYTERHUB_CLIENT_ID}`,
  );
  url.searchParams.set("redirect_uri", `${origin}/api/auth/callback`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", session.state);

  return NextResponse.redirect(url);
}
