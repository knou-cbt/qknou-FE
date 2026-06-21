import { NextResponse } from "next/server";
import { TutorApiPaths } from "@/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authorization = req.headers.get("authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(TutorApiPaths.chat, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "text/plain; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "튜터 API 프록시 호출에 실패했습니다." },
      { status: 500 },
    );
  }
}
