"use server";

import { cookies } from "next/headers";

export type Payment = {
    id: string;
    policyId: string;
    policyNumber: string;
    accountId: string;
    accountName: string;
    productId: string;
    productName: string;
    plot: string;
    price: number;
    paymentStatus: "PAID" | "PENDING" | "DEFEATED";
    parentId?: string;
    dueDate: string;
    paymentDate?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PaymentsResponse = {
    data: Payment[] | null;
    error: string | null;
};

export type GetPaymentsParams = {
    month?: number;
    year?: number;
    clientId?: string;
    productId?: string;
    status?: "PAID" | "PENDING" | "DEFEATED";
};

const API_BASE_URL = process.env.API_URL || "http://localhost:3001";

export async function getPayments(
    params: GetPaymentsParams = {},
    clientToken?: string
): Promise<PaymentsResponse> {
    try {
        const { month, year, clientId, productId, status } = params;
        const queryParams = new URLSearchParams();

        if (month) queryParams.append("dueDateMonth", month.toString());
        if (year) queryParams.append("dueDateYear", year.toString());
        if (clientId) queryParams.append("clientId", clientId);
        if (productId) queryParams.append("productId", productId);
        if (status) queryParams.append("status", status);

        const response = await fetch(
            `${API_BASE_URL}/payments?${queryParams.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${
                        clientToken ||
                        (await cookies()).get("client_token")?.value
                    }`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar pagamentos");
        }

        const responseData = await response.json();
        return {
            data: responseData.payments || [],
            error: null,
        };
    } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Erro ao buscar pagamentos",
        };
    }
}
