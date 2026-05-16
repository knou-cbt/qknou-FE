import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const refsBase = path.join(process.cwd(), "refs");
  const filePath = path.join(refsBase, ...segments);

  // path traversal 방지
  if (!filePath.startsWith(refsBase + path.sep) && filePath !== refsBase) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const file = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(file, { headers: { "Content-Type": contentType } });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
