import { NextRequest, NextResponse } from "next/server";

import {
  getNotebookByIdForCurrentUser,
  getNotebooksForCurrentUser,
  createNotebookForCurrentUser,
  updateNotebookForCurrentUser,
  deleteNotebookForCurrentUser,
} from "@/services/server/savedNotebooks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get("id");

    if (id) {
      const notebook = await getNotebookByIdForCurrentUser(id);

      if (!notebook)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(notebook);
    }
    const notebooks = await getNotebooksForCurrentUser();

    return NextResponse.json(notebooks);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch notebooks" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, serverOptions } = body;
    const notebook = await createNotebookForCurrentUser({
      name,
      description,
      serverOptions,
    });

    return NextResponse.json(notebook, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create notebook" },
      { status: 400 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const notebook = await updateNotebookForCurrentUser(id, data);

    if (!notebook)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(notebook);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update notebook" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteNotebookForCurrentUser(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete notebook" },
      { status: 400 },
    );
  }
}
