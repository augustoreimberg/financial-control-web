"use server"

import { cookies } from "next/headers"

export type Policy = {
  id: string
  name: string
  clientId: string
  productId: string
  policyNumber: string
  validity: string
  frequency: "MONTHLY" | "ANNUAL"
  monthlyPremium: number
  annualPremium: number
  paymentMethod: "CREDIT" | "DEBIT" | "BILL"
  dueDate: string
  createdAt: string
  updatedAt: string
  client?: {
    name: string
    email: string
  }
  product?: {
    name: string
  }
}

export type PoliciesResponse = {
  data: Policy[] | null
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

export const getPolicies = async (
  {
    id,
    policyNumber,
    clientId,
    productId,
    month,
    year,
  }: {
    id?: string
    policyNumber?: string
    clientId?: string
    productId?: string
    month?: number
    year?: number
  } = {},
  clientToken?: string,
): Promise<PoliciesResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    const queryParams = new URLSearchParams()
    if (id) queryParams.append("id", id)
    if (policyNumber) queryParams.append("policyNumber", policyNumber)
    if (clientId) queryParams.append("clientId", clientId)
    if (productId) queryParams.append("productId", productId)
    if (month !== undefined) queryParams.append("month", month.toString())
    if (year !== undefined) queryParams.append("year", year.toString())

    const queryString = queryParams.toString()
    const url = `${process.env.API_URL}/policies${queryString ? `?${queryString}` : ""}`

    console.log(`Buscando apólices: ${url}`)

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
      throw new Error(`Falha ao buscar apólices: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Dados recebidos da API:", data)

    if (Array.isArray(data)) {
      console.log("Apólices recebidas (array):", data.length)
      return {
        data: data,
        error: null,
      }
    } else if (data.policies && Array.isArray(data.policies)) {
      console.log("Apólices recebidas (objeto):", data.policies.length)
      return {
        data: data.policies,
        error: null,
      }
    } else if (data.policy) {
      return {
        data: [data.policy],
        error: null,
      }
    }

    console.log("Formato de resposta não reconhecido, tentando usar dados como estão")
    return {
      data: Array.isArray(data) ? data : [],
      error: null,
    }
  } catch (error) {
    console.error("Erro ao buscar apólices:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao buscar apólices",
    }
  }
}
