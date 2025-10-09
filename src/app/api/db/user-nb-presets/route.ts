import { NextRequest, NextResponse } from "next/server";

import {
  getPresetById,
  getPresets,
  createPreset,
  updatePreset,
  deletePreset,
} from "@/services/server/notebookPresets";
import { User } from "@/services/client/jupyterHub/generated_models";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get("id");

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    if (id) {
      const idNum = await getNumberOrThrow(id);
      const preset = await getPresetById(userId, idNum);

      if (!preset)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(preset);
    }
    const presets = await getPresets(userId);

    return NextResponse.json(presets);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch presets" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body;

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    const preset = await createPreset(userId, data);

    return NextResponse.json(preset, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create preset" },
      { status: 400 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = await getNumberOrThrow(searchParams.get("id"));
    const body = await req.json();
    const data = body;

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    const preset = await updatePreset(userId, id, data);

    return NextResponse.json(preset, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update preset" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = await getNumberOrThrow(searchParams.get("id"));

    const userId = await getCurrentUserName(
      req.cookies.get("jupyterhub_token")?.value || "",
    );

    await deletePreset(userId, id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete preset" },
      { status: 400 },
    );
  }
}

async function getNumberOrThrow(id: string | null): Promise<number> {
  const idNum = Number(id);

  if (isNaN(idNum)) {
    throw new Error("Invalid id: must be a number");
  }

  return idNum;
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
