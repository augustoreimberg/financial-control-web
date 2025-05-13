"use server"

import { cookies } from "next/headers"

export type User = {
  id: string
  name: string
  email: string
  role: "ADVISOR" | "BROKER" | string
  createdAt: string
  updatedAt: string
}

export type Client = {
  id: string
  name: string
  email: string
  sinacorCode: string
  accountNumber: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  users: User[]
}

export type ClientsResponse = {
  data: Client[] | null
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

  return finalToken.replace(/^Bearer\s+/i, "")
}

export const getClients = async (
  {
    id,
    email,
    sinacorCode,
    accountNumber,
    role,
    userId,
    name,
    createdAt,
    updatedAt,
    deletedAt,
  }: {
    id?: string
    email?: string
    sinacorCode?: string
    accountNumber?: string
    role?: string
    userId?: string
    name?: string
    createdAt?: string
    updatedAt?: string
    deletedAt?: string
  } = {},
  clientToken?: string,
): Promise<ClientsResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    const queryParams = new URLSearchParams()
    if (id) queryParams.append("id", id)
    if (email) queryParams.append("email", email)
    if (sinacorCode) queryParams.append("sinacorCode", sinacorCode)
    if (accountNumber) queryParams.append("accountNumber", accountNumber)
    if (role) queryParams.append("role", role)
    if (userId) queryParams.append("userId", userId)
    if (name) queryParams.append("name", name)
    if (createdAt) queryParams.append("createdAt", createdAt)
    if (updatedAt) queryParams.append("updatedAt", updatedAt)
    if (deletedAt) queryParams.append("deletedAt", deletedAt)

    const queryString = queryParams.toString()
    const url = `${process.env.API_URL}/accounts${queryString ? `?${queryString}` : ""}`

    console.log(`Buscando clientes: ${url}`)

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
      throw new Error(`Falha ao buscar clientes: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Dados recebidos da API:", data)

    if (data.accounts && Array.isArray(data.accounts)) {
      const transformedClients = data.accounts.map((account: any): Client => ({
        id: account.id,
        name: account.name,
        email: account.email,
        sinacorCode: account.sinacorCode,
        accountNumber: account.accountNumber,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        deletedAt: account.deletedAt,
        users: (account.users || []).map((user: any): User => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      }))

      console.log("Clientes transformados:", transformedClients.length)
      return { data: transformedClients, error: null }
    }

    console.log("Formato de resposta não reconhecido")
    return { data: data, error: null }
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar clientes",
    }
  }
}
