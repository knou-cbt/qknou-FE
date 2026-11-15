import { NextResponse } from "next/server";
import { TutorApiPaths } from "@/constants";
import { sanitizeErrorPayload } from "@/lib/sanitize-error";

const FALLBACK_ERROR = "남은 사용 횟수 조회에 실패했습니다.";

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
      // 에러 문구에 내부 서버 주소(IP·포트 등)가 섞여 오면 브라우저로 넘기지 않는다
      const isError = !response.ok || data?.success === false;
      return NextResponse.json(
        isError ? sanitizeErrorPayload(data, FALLBACK_ERROR) : data,
        { status: response.status },
      );
    }

    const text = await response.text();
    if (!response.ok) {
      // JSON이 아닌 에러 본문(게이트웨이 에러 페이지 등)은 내부 정보가 담길 수 있어 그대로 넘기지 않는다
      return NextResponse.json(
        { success: false, error: FALLBACK_ERROR },
        { status: response.status },
      );
    }
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
