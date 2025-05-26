"use server";

import { cookies } from "next/headers";

export interface UserData {
    user: {
        id: string;
        name: string;
        email: string;
        password: string;
        role: string;
        createdAt: string;
        updatedAt: string | null;
    };
}

async function getAuthToken(clientToken?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    console.log("Token do servidor (raw):", token || "não encontrado");
    console.log("Token do cliente (raw):", clientToken || "não encontrado");

    const finalToken = token || clientToken;

    if (!finalToken) {
        console.error("ERRO: Nenhum token de autenticação encontrado!");
        throw new Error("Não autenticado - token não encontrado");
    }

    const cleanToken = finalToken.replace(/^Bearer\s+/i, "");

    console.log("Token final (limpo):", cleanToken.substring(0, 15) + "...");

    return cleanToken;
}

export async function getUserProfile(userId: string, clientToken?: string) {
    try {
        const token = await getAuthToken(clientToken);

        console.log(`Buscando perfil do usuário: ${userId}`);

        const authHeader = `Bearer ${token}`;
        console.log(
            "Cabeçalho de autorização completo:",
            authHeader.substring(0, 20) + "..."
        );

        const response = await fetch(
            `${process.env.API_URL}/users?id=${userId}`,
            {
                headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                cache: "no-store",
            }
        );

        console.log("Status da resposta:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Erro na resposta da API: ${response.status} - ${errorText}`
            );
            throw new Error(
                `Falha ao buscar dados do usuário: ${response.status} - ${
                    errorText || "Sem detalhes"
                }`
            );
        }

        const data: UserData = await response.json();
        console.log("Dados do usuário obtidos com sucesso");
        console.log("Estrutura dos dados:", JSON.stringify(data, null, 2));

        return {
            success: true,
            data,
            error: null,
        };
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
            data: null,
        };
    }
}

export async function updateUserProfile(
    userId: string,
    userData: { name: string; email: string; password: string },
    clientToken?: string
) {
    try {
        const token = await getAuthToken(clientToken);

        console.log(`Atualizando perfil do usuário: ${userId}`);
        console.log("Dados para atualização:", userData);

        const authHeader = `Bearer ${token}`;
        console.log("Cabeçalho de autorização completo:", authHeader);

        const response = await fetch(`${process.env.API_URL}/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
                Accept: "application/json",
            },
            body: JSON.stringify(userData),
        });

        console.log("Status da resposta:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Erro na resposta da API: ${response.status} - ${errorText}`
            );
            throw new Error(
                `Falha ao atualizar perfil: ${response.status} - ${
                    errorText || "Sem detalhes"
                }`
            );
        }

        console.log("Perfil atualizado com sucesso");

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

export async function createUser(
    userData: { name: string; email: string; password: string; role: string },
    clientToken?: string
) {
    try {
        const token = await getAuthToken(clientToken);

        console.log("Criando novo usuário");
        console.log("Dados para criação:", { ...userData, password: "***" });

        const authHeader = `Bearer ${token}`;
        console.log("Cabeçalho de autorização completo:", authHeader);

        const response = await fetch(`${process.env.API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
                Accept: "application/json",
            },
            body: JSON.stringify(userData),
        });

        console.log("Status da resposta:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Erro na resposta da API: ${response.status} - ${errorText}`
            );
            throw new Error(
                `Falha ao criar usuário: ${response.status} - ${
                    errorText || "Sem detalhes"
                }`
            );
        }

        console.log("Usuário criado com sucesso");

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}
