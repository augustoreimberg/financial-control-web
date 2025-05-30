"use client";

import LoginForm from "@/components/form/login-form";

export default function Home() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
            <div className="mt-8 text-center text-zinc-500 text-sm">
                <p>
                    © {new Date().getFullYear()} Quark Investimentos. Todos os
                    direitos reservados.
                </p>
            </div>
        </div>
    );
}
