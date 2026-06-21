import { NextResponse } from "next/server";
import { TutorApiPaths } from "@/constants";

export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(TutorApiPaths.remainingCount, {
      method: "GET",
      headers,
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
      { success: false, error: "남은 사용 횟수 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
