import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { SessionData, sessionOptions } from "../lib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (session.state !== state) {
    return new NextResponse("Invalid state", { status: 400 });
  }

  session.destroy();

  if (!code) {
    return new NextResponse("Missing code", { status: 400 });
  }

  try {
    const tokenRes = await fetch(
      `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/api/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: `${process.env.NEXT_PUBLIC_JUPYTERHUB_CLIENT_ID}`,
          client_secret: `${process.env.JUPYTERHUB_API_TOKEN}`,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
        }),
      },
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(tokenData, { status: tokenRes.status });
    }

    const response = NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL),
    );

    response.headers.set(
      "Set-Cookie",
      `jupyterhub_token=${tokenData.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
    );

    return response;
  } catch (err) {
    console.error("Token exchange failed:", err);

    return new NextResponse("OAuth error", { status: 500 });
  }
}
