import { readFile } from "node:fs/promises";
import path from "node:path";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w.-]+$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  const extension = path.extname(file).toLowerCase();
  const type = types[extension];
  if (!type) return new Response("Not found", { status: 404 });

  const root = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
  try {
    const bytes = await readFile(path.join(root, file));
    return new Response(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
