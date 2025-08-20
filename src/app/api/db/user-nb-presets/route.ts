import { NextRequest, NextResponse } from "next/server";

import { notebookPresetsService } from "@/services/server/notebookPresets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get("id");

    if (id) {
      const preset =
        await notebookPresetsService.getPresetByIdForCurrentUser(id);

      if (!preset)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(preset);
    }
    const presets = await notebookPresetsService.getPresetsForCurrentUser();

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
    const { name, description, serverOptions } = body;
    const preset = await notebookPresetsService.createPresetForCurrentUser({
      name,
      description,
      serverOptions,
    });

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
    const body = await req.json();
    const { id, ...data } = body;
    const preset = await notebookPresetsService.updatePresetForCurrentUser(
      id,
      data,
    );

    if (!preset)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(preset);
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
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await notebookPresetsService.deletePresetForCurrentUser(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete preset" },
      { status: 400 },
    );
  }
}
