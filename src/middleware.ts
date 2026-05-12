import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === "true") {
    const url = request.nextUrl.clone();

    if (!url.pathname.startsWith("/maintenance")) {
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
