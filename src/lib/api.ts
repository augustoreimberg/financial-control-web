import { getJwtToken } from "./jwt";

const API_URL = process.env.API_URL;

export async function api(endpoint: string, options: RequestInit = {}) {
    const token = getJwtToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error("Erro na requisição");
    }

    return response.json();
}
