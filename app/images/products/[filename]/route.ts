import { promises as fs } from "fs";
import path from "path";
import { NextRequest } from "next/server";

function getContentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const productsDir = path.join(process.cwd(), "public", "images", "products");
  const requestedPath = path.join(productsDir, filename);
  const placeholderPath = path.join(productsDir, "placeholder.svg");

  try {
    const data = await fs.readFile(requestedPath);
    return new Response(data, {
      headers: {
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    const placeholder = await fs.readFile(placeholderPath);
    return new Response(placeholder, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}
