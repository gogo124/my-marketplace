import { NextResponse } from "next/server";

const EZOIC_ADSTXT_URL = "https://srv.adstxtmanager.com/19390/moroccantrip.net";

export function GET() {
  return NextResponse.redirect(EZOIC_ADSTXT_URL, 308);
}
