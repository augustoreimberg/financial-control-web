"use server"

interface CreateClientResult {
  error?: string
}

export async function createClient(formData: FormData, token?: string): Promise<CreateClientResult> {
  const name = formData.get("name")?.toString()
  const email = formData.get("email")?.toString()
  const sinacorCode = formData.get("sinacorCode")?.toString()
  const accountNumber = formData.get("accountNumber")?.toString()
  const advisorId = formData.get("advisorId")?.toString()
  const brokerId = formData.get("brokerId")?.toString()


  try {
    const response = await fetch(`${process.env.API_URL}/accounts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        account: {
          name,
          email,
          sinacorCode,
          accountNumber,
        },
        users: {
          advisorId,
          brokerId,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { error: `Erro ao criar cliente: ${response.status} - ${errorText}` }
    }

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido ao criar cliente" }
  }
}
