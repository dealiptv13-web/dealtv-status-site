import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (!password) {
      return NextResponse.json(
        { ok: false, message: "Şifre gerekli." },
        { status: 400 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, message: "Şifre hatalı." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("admin_session", "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Giriş yapılamadı." },
      { status: 500 }
    );
  }
}