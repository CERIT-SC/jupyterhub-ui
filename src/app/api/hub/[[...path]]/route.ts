import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

async function proxyToJupyterHub(req: NextRequest, path?: string[]) {
  const token = req.cookies.get("jupyterhub_token")?.value;

  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const upstreamUrl = `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/api/${(path || []).join("/")}${req.nextUrl.search || ""}`;

  const proxyRes = await fetch(upstreamUrl, {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      host: new URL(`${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}`).host,
      authorization: `token ${token}`,
    },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    // @ts-ignore
    duplex: ["GET", "HEAD"].includes(req.method) ? undefined : "half",
    redirect: "manual",
  });

  const resHeaders = new Headers(proxyRes.headers);
  const hasBody =
    (proxyRes.headers.has("content-length") &&
      proxyRes.headers.get("content-length") !== "0") ||
    proxyRes.headers.has("transfer-encoding");

  const body = hasBody ? await proxyRes.arrayBuffer() : null;

  return new NextResponse(body, {
    status: proxyRes.status,
    headers: resHeaders,
  });
}
