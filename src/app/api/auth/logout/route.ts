import { NextResponse } from "next/server";

export async function GET() {
  const url = new URL(`${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/logout`);

  return NextResponse.redirect(url);
}
