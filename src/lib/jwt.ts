import { cookies } from "next/headers";

export const getJwtToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");
    return token?.value;
};

export const setJwtToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "accessToken",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });
};

export const removeJwtToken = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
};
