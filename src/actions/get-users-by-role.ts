"use server"

import { cookies } from "next/headers"

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: "ADVISOR" | "BROKER"
  createdAt: string
  updatedAt: string
}

export type UsersResponse = {
  data: User[] | null
  error: string | null
}

async function getAuthToken(clientToken?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const finalToken = token || clientToken

  if (!finalToken) {
    console.error("ERRO: Nenhum token de autenticação encontrado!")
    throw new Error("Não autenticado - token não encontrado")
  }

  const cleanToken = finalToken.replace(/^Bearer\s+/i, "")
  return cleanToken
}

export const getUsers = async (
  { role }: { role?: "ADVISOR" | "BROKER" } = {},
  clientToken?: string
): Promise<UsersResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    const queryParams = new URLSearchParams()
    if (role) queryParams.append("role", role)

    const queryString = queryParams.toString()
    const url = `${process.env.API_URL}/users${queryString ? `?${queryString}` : ""}`

    console.log(`Buscando usuários: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log("Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na resposta da API: ${response.status} - ${errorText}`)
      throw new Error(`Falha ao buscar usuários: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Dados recebidos da API:", data)

    if (data.users && Array.isArray(data.users)) {
      return {
        data: data.users,
        error: null,
      }
    }

    console.log("Formato de resposta não reconhecido")
    return {
      data: [],
      error: null,
    }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao buscar usuários",
    }
  }
}
