import { NextRequest, NextResponse } from "next/server";

import {

  getNotebooksForCurrentUser,
  createNotebookForCurrentUser,
  updateNotebookForCurrentUser,
  getNotebookByServerNameForCurrentUser,
  deleteNotebookForCurrentUser
} from "@/services/server/savedNotebooks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const name = searchParams.get("name");

    if (name) {
      const notebook = await getNotebookByServerNameForCurrentUser(name);

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
    const { name, ...data } = body;

    const existing = await getNotebookByServerNameForCurrentUser(name);

    if (existing) {
      const notebook = await updateNotebookForCurrentUser(name, data);
      return NextResponse.json(notebook, { status: 201 });
    }

    const notebook = await createNotebookForCurrentUser(body);

    return NextResponse.json(notebook, { status: 201 });
  } catch (err: any) {
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

    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    await deleteNotebookForCurrentUser(name);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete notebook" },
      { status: 400 },
    );
  }
}
