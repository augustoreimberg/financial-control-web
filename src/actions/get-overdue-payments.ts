"use server"

import { cookies } from "next/headers"
import type { Payment } from "./get-payments"

export type OverduePaymentsResponse = {
  data: Payment[] | null
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

export const getOverduePayments = async (clientToken?: string): Promise<OverduePaymentsResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    const url = `${process.env.API_URL}/payment/overdue`
    console.log(`Buscando pagamentos atrasados: ${url}`)

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
      throw new Error(`Falha ao buscar pagamentos atrasados: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Dados recebidos da API:", data)

    // Transformar a estrutura específica da API em um formato mais fácil de usar
    if (data.payments && Array.isArray(data.payments)) {
      const transformedPayments = data.payments.map((payment: any) => ({
        id: payment._id.value,
        policyId: payment.props.policyId,
        plot: payment.props.plot,
        price: payment.props.price,
        paymentStatus: payment.props.paymentStatus,
        parentId: payment.props.parentId,
        dueDate: payment.props.dueDate,
        paymentDate: payment.props.paymentDate || null,
        createdAt: payment.props.createdAt,
        updatedAt: payment.props.updatedAt || payment.props.createdAt,
        // Adicionar propriedades vazias para policy que serão preenchidas depois
        policy: {
          name: "Apólice " + payment.props.policyId.substring(0, 8),
          clientId: "",
          client: {
            name: "Cliente",
          },
        },
      }))

      console.log("Pagamentos atrasados transformados:", transformedPayments.length)
      return {
        data: transformedPayments,
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
    console.error("Erro ao buscar pagamentos atrasados:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao buscar pagamentos atrasados",
    }
  }
}
