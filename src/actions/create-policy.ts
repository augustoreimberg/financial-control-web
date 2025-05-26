"use server";

import { cookies } from "next/headers";

export type Policy = {
    id: string;
    name: string;
    clientId: string;
    productId: string;
    policyNumber: string;
    validity: string;
    frequency: "MONTHLY" | "ANNUAL";
    monthlyPremium: number;
    annualPremium?: number;
    paymentMethod: "CREDIT" | "DEBIT" | "BILL";
    dueDate: string;
    paymentDay?: number;
    createdAt: string;
    updatedAt: string;
};

export type PolicyResponse = {
    data: Policy | null;
    error: string | null;
};

async function getAuthToken(clientToken?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const finalToken = token || clientToken;

    if (!finalToken) {
        console.error("ERRO: Nenhum token de autenticação encontrado!");
        throw new Error("Não autenticado - token não encontrado");
    }

    return finalToken.replace(/^Bearer\s+/i, "");
}

export const createPolicy = async (
    formData: FormData,
    clientToken?: string
): Promise<PolicyResponse> => {
    try {
        const token = await getAuthToken(clientToken);

        const name = formData.get("name") as string;
        const accountId = formData.get("clientId") as string;
        const productId = formData.get("productId") as string;
        const policyNumber = formData.get("policyNumber") as string;
        const validity = formData.get("validity") as string;
        const frequency = formData.get("frequency") as "MONTHLY" | "ANNUAL";
        const monthlyPremium = parseFloat(
            formData.get("monthlyPremium") as string
        );
        const annualPremiumRaw = formData.get("annualPremium") as string;
        const paymentMethod = formData.get("paymentMethod") as
            | "CREDIT"
            | "DEBIT"
            | "BILL";
        const dueDate = formData.get("dueDate") as string;
        const paymentDay = formData.get("paymentDay")?.toString() || null;

        if (!name || name.trim().length < 2) {
            return {
                data: null,
                error: "Nome da apólice deve ter pelo menos 2 caracteres",
            };
        }

        if (!accountId) {
            return { data: null, error: "Cliente é obrigatório" };
        }

        if (!productId) {
            return { data: null, error: "Produto é obrigatório" };
        }

        console.log(`Criando apólice: ${name}`);

        const body: {
            name: string;
            accountId: string;
            productId: string;
            policyNumber: string;
            validity: string;
            frequency: "MONTHLY" | "ANNUAL";
            monthlyPremium: number;
            paymentMethod: "CREDIT" | "DEBIT" | "BILL";
            dueDate: string;
            paymentDay?: string | null;
            annualPremium?: number;
        } = {
            name,
            accountId,
            productId,
            policyNumber,
            validity,
            frequency,
            monthlyPremium,
            paymentMethod,
            dueDate,
            paymentDay,
        };

        if (annualPremiumRaw) {
            const annualPremium = parseFloat(annualPremiumRaw);
            if (!isNaN(annualPremium)) {
                body.annualPremium = annualPremium;
            }
        }

        const response = await fetch(`${process.env.API_URL}/policies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("Status da resposta:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Erro na resposta da API: ${response.status} - ${errorText}`
            );
            throw new Error(
                `Falha ao criar apólice: ${response.status} - ${
                    errorText || "Sem detalhes"
                }`
            );
        }

        const data = await response.json();
        console.log("Apólice criada com sucesso:", data.policy?.id);

        return {
            data: data.policy,
            error: null,
        };
    } catch (error) {
        console.error("Erro ao criar apólice:", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erro desconhecido ao criar apólice",
        };
    }
};
