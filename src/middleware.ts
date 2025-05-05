import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register"]

// Rotas que apenas admin pode acessar
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar o token no cookie
  const token = request.cookies.get("access_token")?.value

  // Verificar também o token no localStorage (via cookie especial)
  const clientToken = request.cookies.get("client_token")?.value

  const hasToken = token || clientToken

  console.log(`Middleware executando para: ${pathname}`)
  console.log(`Token no cookie: ${token ? token.substring(0, 15) + "..." : "ausente"}`)
  console.log(`Token no client_token: ${clientToken ? clientToken.substring(0, 15) + "..." : "ausente"}`)
  console.log(`Token final: ${hasToken ? "presente" : "ausente"}`)

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/public"))

  // Se não tiver token e a rota não for pública, redireciona para login
  if (!hasToken && !isPublicRoute) {
    console.log(`Redirecionando para login: ${pathname} -> /`)
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Se tiver token e estiver tentando acessar a página de login, redireciona para o dashboard
  if (hasToken && (pathname === "/" || pathname === "/login")) {
    console.log(`Redirecionando para dashboard: ${pathname} -> /dashboard`)
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Verificar permissões de admin (exemplo)
  if (hasToken && adminRoutes.some((route) => pathname.startsWith(route))) {
    // Aqui você poderia decodificar o token e verificar se o usuário tem role de admin
    // Para este exemplo, vamos apenas verificar se existe um cookie de role
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
