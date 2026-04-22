export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sizeParam = Number(searchParams.get("size") || "1000000");

  const size = Number.isFinite(sizeParam)
    ? Math.min(Math.max(sizeParam, 100000), 2000000)
    : 1000000;

  const buffer = Buffer.alloc(size, 1);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}