import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveLocale, SITE_LOCALE_COOKIE } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === "moroccantrip.net") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "www.moroccantrip.net";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const locale = resolveLocale(request.nextUrl.searchParams.get("lang") || undefined);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-site-locale", locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.cookies.set(SITE_LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax"
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"]
};
