import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    
  const path = request.nextUrl.pathname

  const isPublicPath = path === "/"

  const token = request.cookies.get("accessToken")?.value || ""

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/profile/:path*"],
}

