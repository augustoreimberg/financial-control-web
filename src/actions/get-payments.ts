"use server"

import { cookies } from "next/headers"

export type Payment = {
  id: string
  policyId: string
  policyNumber: string
  accountId: string
  accountName: string
  productId: string
  productName: string
  plot: string
  price: number
  paymentStatus: "PAID" | "PENDING" | "DEFEATED"
  parentId?: string
  dueDate: string
  paymentDate?: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentsResponse = {
  data: Payment[] | null
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

export const getPayments = async (
  {
    id,
    policyId,
    status,
    month,
    year,
  }: {
    id?: string
    policyId?: string
    status?: "PAID" | "PENDING" | "DEFEATED"
    month?: number
    year?: number
  } = {},
  clientToken?: string
): Promise<PaymentsResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    const queryParams = new URLSearchParams()
    if (id) queryParams.append("id", id)
    if (policyId) queryParams.append("policyId", policyId)
    if (status) queryParams.append("status", status)
    if (month !== undefined) queryParams.append("month", month.toString())
    if (year !== undefined) queryParams.append("year", year.toString())

    const queryString = queryParams.toString()
    const url = `${process.env.API_URL}/payments${queryString ? `?${queryString}` : ""}`

    console.log(`Buscando pagamentos: ${url}`)

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
      throw new Error(`Falha ao buscar pagamentos: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Dados recebidos da API:", data)

    if (data.payments && Array.isArray(data.payments)) {
      return {
        data: data.payments,
        error: null,
      }
    }

    console.log("Formato de resposta não reconhecido")
    return {
      data: [],
      error: null,
    }
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao buscar pagamentos",
    }
  }
}
