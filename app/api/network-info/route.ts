import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const h = await headers();

    const city = h.get("x-vercel-ip-city") || "";
    const country = h.get("x-vercel-ip-country") || "";
    const region = h.get("x-vercel-ip-country-region") || "";

    let provider = "Tespit edilemedi";
    let ip = "";

    const forwardedFor = h.get("x-forwarded-for");
    const realIp = h.get("x-real-ip");

    if (forwardedFor) {
      ip = forwardedFor.split(",")[0]?.trim() || "";
    } else if (realIp) {
      ip = realIp;
    }

    if (ip) {
      try {
        const response = await fetch(`https://ipwho.is/${ip}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (data?.success) {
          provider =
            data?.connection?.isp ||
            data?.connection?.org ||
            data?.isp ||
            data?.org ||
            "Tespit edilemedi";
        }
      } catch (error) {
        console.error("NETWORK PROVIDER FETCH ERROR:", error);
      }
    }

    return Response.json({
      ok: true,
      city: city || "Bilinmiyor",
      country: country || "Bilinmiyor",
      region: region || "",
      provider,
      ip: ip || "Bilinmiyor",
    });
  } catch (error) {
    console.error("NETWORK INFO ERROR:", error);

    return Response.json(
      {
        ok: false,
        city: "Bilinmiyor",
        country: "Bilinmiyor",
        region: "",
        provider: "Tespit edilemedi",
        ip: "Bilinmiyor",
      },
      { status: 500 }
    );
  }
}