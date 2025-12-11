import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // enable streaming in Node runtime

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return proxyToJupyterHub(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function OPTIONS(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function HEAD(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;

  return proxyToJupyterHub(req, path);
}

async function proxyToJupyterHub(req: NextRequest, path?: string[]) {
  const token = req.cookies.get("jupyterhub_token")?.value;
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  const upstreamUrl = `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/${(path || []).join("/")}${req.nextUrl.search || ""}`;
  console.log(`Proxying request to JupyterHub upstream URL: ${upstreamUrl}`);
  const isSSERequest = (req.headers.get("accept") || "").toLowerCase().includes("text/event-stream");

  const outgoing = new Headers(req.headers);
  outgoing.set("host", new URL(`${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}`).host);
  outgoing.set("authorization", `token ${token}`);

  if (isSSERequest) {
    // avoid compression buffering breaking SSE
    outgoing.delete("accept-encoding");
  }

  const proxyRes = await fetch(upstreamUrl, {
    method: req.method,
    headers: outgoing,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    // @ts-ignore
    duplex: ["GET", "HEAD"].includes(req.method) ? undefined : "half",
    redirect: "manual",
  });

  const resHeaders = new Headers(proxyRes.headers);

  const isSSEResponse = resHeaders.get("content-type")?.toLowerCase().includes("text/event-stream") ?? false;

  if (isSSERequest || isSSEResponse) {
    resHeaders.set("content-type", "text/event-stream; charset=utf-8");
    resHeaders.set("cache-control", "no-cache, no-transform");
    resHeaders.set("connection", "keep-alive");
    resHeaders.set("x-accel-buffering", "no");
    resHeaders.delete("content-length");
    resHeaders.delete("content-encoding");

    return new NextResponse(proxyRes.body, {
      status: proxyRes.status,
      headers: resHeaders,
    });
  }

  const hasBody =
    (resHeaders.has("content-length") && resHeaders.get("content-length") !== "0") ||
    resHeaders.has("transfer-encoding");

  const body = hasBody ? await proxyRes.arrayBuffer() : null;

  return new NextResponse(body, {
    status: proxyRes.status,
    headers: resHeaders,
  });
}
