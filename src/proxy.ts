import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {

  const token =
    req.cookies.get("token")?.value;

  const { pathname } =
    req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/auth");

  const isViewerDashboard =
    pathname.startsWith(
      "/viewer/dashboard"
    );

  const isPhotographerDashboard =
    pathname.startsWith(
      "/photographer/dashboard"
    );

  // NOT LOGGED IN
  if (!token) {

    if (
      isViewerDashboard ||
      isPhotographerDashboard
    ) {

      return NextResponse.redirect(
        new URL("/auth", req.url)
      );

    }

    return NextResponse.next();

  }

  // LOGGED IN → block auth page
  if (isAuthPage) {

    return NextResponse.next();

  }

  return NextResponse.next();

}

export const config = {

  matcher: [

    "/auth",

    "/viewer/dashboard/:path*",

    "/photographer/dashboard/:path*",

  ],

};
