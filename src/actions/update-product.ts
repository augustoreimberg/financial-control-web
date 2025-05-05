"use server"

import { cookies } from "next/headers"
import type { Product } from "./get-product"

export type ProductResponse = {
  data: Product | null
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

export const updateProduct = async (formData: FormData, clientToken?: string): Promise<ProductResponse> => {
  try {
    const token = await getAuthToken(clientToken)
    const id = formData.get("id") as string
    const name = formData.get("name") as string

    if (!id) {
      return {
        data: null,
        error: "ID do produto é obrigatório",
      }
    }

    if (!name || name.trim().length < 2) {
      return {
        data: null,
        error: "Nome do produto deve ter pelo menos 2 caracteres",
      }
    }

    console.log(`Atualizando produto: ${id} - ${name}`)
    console.log("URL da API:", `${process.env.API_URL}/products/${id}`)

    // Enviar apenas o nome no corpo da requisição, já que o ID está na URL
    const response = await fetch(`${process.env.API_URL}/products/${id}`, {
      method: "PUT",
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
      throw new Error(`Falha ao atualizar produto: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Produto atualizado com sucesso:", data.product?.id || id)

    // Se a API não retornar o produto atualizado, construímos um objeto com os dados que temos
    const updatedProduct = data.product || {
      id,
      name,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    return {
      data: updatedProduct,
      error: null,
    }
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao atualizar produto",
    }
  }
}
