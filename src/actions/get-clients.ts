"use server"

import { cookies } from "next/headers"

export type Client = {
  id: string
  name: string
  email: string
  sinacorCode: string
  accountNumber: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ClientsResponse = {
  data: Client[] | null
  error: string | null
}

async function getAuthToken(clientToken?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  // Usar o token do servidor ou o token do cliente
  const finalToken = token || clientToken

  if (!finalToken) {
    console.error("ERRO: Nenhum token de autenticação encontrado!")
    throw new Error("Não autenticado - token não encontrado")
  }

  // Garantir que o token não tenha o prefixo "Bearer " duplicado
  const cleanToken = finalToken.replace(/^Bearer\s+/i, "")
  return cleanToken
}

// Modificar a função getClients para lidar com a estrutura específica da API
export const getClients = async (
  {
    id,
    email,
    sinacorCode,
    accountNumber,
    role,
    userId,
  }: {
    id?: string
    email?: string
    sinacorCode?: string
    accountNumber?: string
    role?: string
    userId?: string
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

    const queryString = queryParams.toString()
    // Modificar a URL para usar /accounts em vez de /clients
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

    // Transformar a estrutura específica da API em um formato mais fácil de usar
    if (data.accounts && Array.isArray(data.accounts)) {
      const transformedClients = data.accounts.map((account: any) => ({
        id: account._id.value,
        name: account.props.name,
        email: account.props.email,
        sinacorCode: account.props.sinacorCode,
        accountNumber: account.props.accountNumber,
        createdAt: account.props.createdAt,
        updatedAt: account.props.updatedAt,
        deletedAt: account.props.deletedAt,
      }))

      console.log("Clientes transformados:", transformedClients.length)
      return {
        data: transformedClients,
        error: null,
      }
    }

    // Caso não consiga identificar o formato, retorna um array vazio
    console.log("Formato de resposta não reconhecido")
    return {
      data: [],
      error: null,
    }
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao buscar clientes",
    }
  }
}
