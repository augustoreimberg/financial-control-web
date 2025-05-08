"use server"

interface UpdateClientResult {
  error?: string
}

export async function updateClient(formData: FormData, token?: string): Promise<UpdateClientResult> {
  const id = formData.get("id")?.toString()
  const name = formData.get("name")?.toString()
  const email = formData.get("email")?.toString()
  const sinacorCode = formData.get("sinacorCode")?.toString()
  const accountNumber = formData.get("accountNumber")?.toString()

  if (!id) return { error: "ID do cliente não informado para atualização" }

  try {
    const response = await fetch(`${process.env.API_URL}/accounts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        sinacorCode,
        accountNumber,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { error: `Erro ao atualizar cliente: ${response.status} - ${errorText}` }
    }

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido ao atualizar cliente" }
  }
}
