"use server"

import { cookies } from "next/headers"

export type Product = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type ProductsResponse = {
  data: Product[] | null
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

export const getProducts = async (
  { id, name }: { id?: string; name?: string } = {},
  clientToken?: string,
): Promise<ProductsResponse> => {
  try {
    const token = await getAuthToken(clientToken)

    const queryParams = new URLSearchParams()
    if (id) queryParams.append("id", id)
    if (name) queryParams.append("name", name)

    const queryString = queryParams.toString()
    const url = `${process.env.API_URL}/products${queryString ? `?${queryString}` : ""}`

    console.log(`Buscando produtos: ${url}`)

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
      throw new Error(`Falha ao buscar produtos: ${response.status} - ${errorText || "Sem detalhes"}`)
    }

    const data = await response.json()
    console.log("Dados recebidos da API:", data)

    if (Array.isArray(data)) {
      console.log("Produtos recebidos (array):", data.length)
      return {
        data: data,
        error: null,
      }
    } else if (data.products && Array.isArray(data.products)) {
      console.log("Produtos recebidos (objeto):", data.products.length)
      return {
        data: data.products,
        error: null,
      }
    } else if (data.product) {
      return {
        data: [data.product],
        error: null,
      }
    }

    console.log("Formato de resposta não reconhecido, tentando usar dados como estão")
    return {
      data: Array.isArray(data) ? data : [],
      error: null,
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message,
      }
    }
    return {
      data: null,
      error: "Erro desconhecido ao buscar produtos",
    }
  }
}
