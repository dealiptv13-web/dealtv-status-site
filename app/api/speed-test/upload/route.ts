export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.arrayBuffer();

  return Response.json({
    ok: true,
    receivedBytes: body.byteLength,
  });
}