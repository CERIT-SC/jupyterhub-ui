import { NextRequest, NextResponse } from "next/server";

import {
  getNotebooks,
  createNotebook,
  updateNotebook,
  getNotebookByServerName,
  deleteNotebook,
} from "@/services/server/savedNotebooks";
import { User } from "@/services/client/jupyterHub/generated_models";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const name = searchParams.get("name");

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    if (name) {
      const notebook = await getNotebookByServerName(userId, name);

      if (!notebook)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(notebook);
    }
    const notebooks = await getNotebooks(userId);

    return NextResponse.json(notebooks);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch notebooks" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  console.log(
    "POST /api/db/user-nb called",
    req.cookies.get("jupyterhub_token")?.value,
  );
  try {
    const body = await req.json();
    const { name, ...data } = body;

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    const existing = await getNotebookByServerName(userId, name);

    if (existing) {
      const notebook = await updateNotebook(userId, name, data);

      return NextResponse.json(notebook, { status: 201 });
    }

    const notebook = await createNotebook(userId, body);

    return NextResponse.json(notebook, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/db/user-nb:", err);

    return NextResponse.json(
      { error: err.message || "Failed to create notebook" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const name = searchParams.get("name");

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    if (!name)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    await deleteNotebook(userId, name);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete notebook" },
      { status: 400 },
    );
  }
}

async function getCurrentUserName(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}/hub/api/user`,
      {
        method: "GET",
        headers: {
          host: new URL(`${process.env.NEXT_PUBLIC_JUPYTERHUB_URL}`).host,
          authorization: `token ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`JupyterHub API error: ${response.status}`);
    }
    const user: User = await response.json();

    if (!user || !user.name) throw new Error("Not authenticated");

    return user.name;
  } catch (error: any) {
    throw error;
  }
}
