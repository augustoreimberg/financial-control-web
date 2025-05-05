"use server"

import { cookies } from "next/headers"

export type PaymentsStatusResponse = {
  total: number
  statuses: {
    paid: number
    pending: number
    defeated: number
  }
}

export async function getPaymentMetrics(clientToken?: string): Promise<PaymentsStatusResponse | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value || clientToken

  if (!token) {
    console.error("ERRO: Nenhum token de autenticação encontrado!")
    throw new Error("Não autenticado - token não encontrado")
  }

  const cleanToken = token.replace(/^Bearer\s+/i, "")
  const url = `${process.env.API_URL || "http://localhost:8080"}/metrics/payments`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Erro ao buscar métricas de pagamento: ${response.status} - ${text}`)
      throw new Error(text)
    }

    const data: PaymentsStatusResponse = await response.json()
    return data
  } catch (err) {
    console.error("Erro ao buscar métricas de pagamento:", err)
    return null
  }
}
