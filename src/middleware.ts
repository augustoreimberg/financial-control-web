import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/login", "/register"]

const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get("access_token")?.value

  const clientToken = request.cookies.get("client_token")?.value

  const hasToken = token || clientToken

  console.log(`Middleware executando para: ${pathname}`)
  console.log(`Token no cookie: ${token ? token.substring(0, 15) + "..." : "ausente"}`)
  console.log(`Token no client_token: ${clientToken ? clientToken.substring(0, 15) + "..." : "ausente"}`)
  console.log(`Token final: ${hasToken ? "presente" : "ausente"}`)

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/public"))

  if (!hasToken && !isPublicRoute) {
    console.log(`Redirecionando para login: ${pathname} -> /`)
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  if (hasToken && (pathname === "/" || pathname === "/login")) {
    console.log(`Redirecionando para dashboard: ${pathname} -> /dashboard`)
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (hasToken && adminRoutes.some((route) => pathname.startsWith(route))) {
    const userRole = request.cookies.get("user_role")?.value

    if (userRole !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|otf|mp4|webm)).*)",
  ],
}


