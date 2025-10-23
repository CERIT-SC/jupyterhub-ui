import { NextResponse } from "next/server";

export async function GET() {
  const hubUrl = process.env.NEXT_PUBLIC_JUPYTERHUB_URL || "";
  if (!hubUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_JUPYTERHUB_URL" },
      { status: 500 },
    );
  }

  let hubOrigin: string;
  try {
    hubOrigin = new URL(hubUrl).origin;
  } catch {
    return NextResponse.json(
      { error: "Invalid NEXT_PUBLIC_JUPYTERHUB_URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ jupyterhubUrl: hubUrl, hubOrigin });
}