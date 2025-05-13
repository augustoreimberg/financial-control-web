"use server"

import { cookies } from "next/headers"
import type { Payment } from "./get-payments"

export type PaymentStatusResponse = {
  data: Payment | null
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

export const updatePaymentStatus = async (
  id: string,
  { paymentStatus, paymentDate }: { paymentStatus: "PAID" | "PENDING" | "DEFEATED"; paymentDate?: string },
  clientToken?: string,
): Promise<PaymentStatusResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    if (!id) {
      return {
        data: null,
        error: "ID do pagamento é obrigatório",
      }
    }

    if (!paymentStatus) {
      return {
        data: null,
        error: "Status do pagamento é obrigatório",
      }
    }

    console.log(`Atualizando status do pagamento: ${id} - ${paymentStatus}`)
    console.log("URL da API:", `${process.env.API_URL}/payments/${id}`)

    const requestBody: { paymentStatus: string; paymentDate?: string } = {
      paymentStatus,
    }

    if (paymentDate) {
      requestBody.paymentDate = paymentDate
    }

    const response = await fetch(`${process.env.API_URL}/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na resposta da API: ${response.status} - ${errorText}`)
      throw new Error(`Falha ao atualizar status do pagamento: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Pagamento atualizado com sucesso:", id)

      const updatedPayment = {
        id,
        policyId: data.payment?.props?.policyId || "",
        policyNumber: data.payment?.props?.policyNumber || "",
        accountId: data.payment?.props?.accountId || "",
        accountName: data.payment?.props?.accountName || "",
        productId: data.payment?.props?.productId || "",
        productName: data.payment?.props?.productName || "",
        plot: data.payment?.props?.plot || "",
        price: data.payment?.props?.price || 0,
        paymentStatus: paymentStatus,
        parentId: data.payment?.props?.parentId || null,
        dueDate: data.payment?.props?.dueDate || "",
        paymentDate: paymentDate || null,
        createdAt: data.payment?.props?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        policy: {
          name: "Apólice " + (data.payment?.props?.policyId || "").substring(0, 8),
          clientId: "",
          client: {
            name: "Cliente",
          },
        },
      };

    return {
      data: updatedPayment,
      error: null,
    }
  } catch (error) {
    console.error("Erro ao atualizar status do pagamento:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao atualizar status do pagamento",
    }
  }
}
