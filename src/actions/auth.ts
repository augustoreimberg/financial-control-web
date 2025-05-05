"use server"

import { cookies } from "next/headers"

type AuthResponse = {
  success: boolean
  data?: {
    accessToken: string // Alterado de access_token para accessToken
    user: {
      id: string
      name?: string
      email: string
      role: string
    }
  }
  error?: string
  redirectTo?: string
}

export async function auth(formData: FormData): Promise<AuthResponse> {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return {
        success: false,
        error: "Email e senha são obrigatórios",
      }
    }

    console.log(`Tentando autenticar: ${email}`)

    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log(`Erro na autenticação: ${JSON.stringify(errorData)}`)
      return {
        success: false,
        error: errorData.message || "Credenciais inválidas",
      }
    }

    const data = await response.json()
    console.log(`Autenticação bem-sucedida para: ${email}`)
    console.log(`Resposta da API:`, data)

    // Armazenar o token em um cookie HTTP-only
    const cookieStore = await cookies()
    cookieStore.set("access_token", data.accessToken, {
      // Alterado de access_token para accessToken
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
      sameSite: "lax",
    })

    console.log(`Cookie definido para: ${email}`)
    console.log(`Token armazenado: ${data.accessToken.substring(0, 15)}...`)

    // Em vez de redirecionar, retornamos um status de sucesso e indicamos para onde redirecionar
    return {
      success: true,
      data,
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return {
      success: false,
      error: "Falha ao conectar com o servidor",
    }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  return { success: true, redirectTo: "/" }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    return null
  }

  return { token }
}
