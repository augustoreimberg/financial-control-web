"use server"

import { cookies } from "next/headers"
import { Product } from "./get-product"

export type ProductResponse = {
  data: Product | null
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

export const createProduct = async (
  formData: FormData,
  clientToken?: string,
): Promise<ProductResponse> => {
  try {
    const token = await getAuthToken(clientToken)
    const name = formData.get("name") as string

    if (!name || name.trim().length < 2) {
      return {
        data: null,
        error: "Nome do produto deve ter pelo menos 2 caracteres",
      }
    }

    console.log(`Criando produto: ${name}`)

    const response = await fetch(`${process.env.API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ name }),
    })

    console.log("Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na resposta da API: ${response.status} - ${errorText}`)
      throw new Error(`Falha ao criar produto: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Produto criado com sucesso:", data.product?.id)

    return {
      data: data.product,
      error: null,
    }
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao criar produto",
    }
  }
}
