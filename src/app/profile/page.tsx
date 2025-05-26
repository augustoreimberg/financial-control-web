"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getUserProfile, type UserData } from "@/actions/user";
import Cookies from "js-cookie";
import ProfileForm from "@/components/form/profile-form";
import CreateUserForm from "@/components/form/create-user-form";

export default function ProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [clientToken, setClientToken] = useState<string | undefined>(
        undefined
    );

    useEffect(() => {
        const checkAuth = () => {
            const userJson = localStorage.getItem("user");
            const token = localStorage.getItem("accessToken");
            const cookieToken = Cookies.get("client_token");

            if (!userJson || (!token && !cookieToken)) {
                console.log(
                    "Usuário não autenticado, redirecionando para login"
                );
                router.push("/");
                return null;
            }

            setClientToken(cookieToken || token || undefined);

            try {
                return JSON.parse(userJson);
            } catch (e) {
                console.error("Erro ao analisar dados do usuário:", e);
                router.push("/");
                return null;
            }
        };

        const fetchUserData = async () => {
            setIsLoading(true);

            const user = checkAuth();
            if (!user) return;

            setUserId(user.id);

            try {
                console.log("Buscando dados do usuário com ID:", user.id);

                const token =
                    Cookies.get("client_token") ||
                    localStorage.getItem("accessToken");

                console.log(
                    "Token do cliente (profile page):",
                    token ? "presente" : "ausente"
                );
                if (token) {
                    console.log(
                        "Primeiros caracteres do token:",
                        token.substring(0, 15) + "..."
                    );
                }

                if (!token) {
                    throw new Error("Token de autenticação não encontrado");
                }

                const result = await getUserProfile(user.id, token);

                if (!result.success) {
                    throw new Error(
                        result.error || "Falha ao buscar dados do usuário"
                    );
                }

                console.log("Dados do usuário recebidos:", result.data);
                console.log(
                    "Estrutura do userData:",
                    JSON.stringify(result.data, null, 2)
                );
                setUserData(result.data);
            } catch (err) {
                console.error("Erro ao buscar dados do usuário:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleProfileUpdated = (name: string, email: string) => {
        const userJson = localStorage.getItem("user");
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                const updatedUser = { ...user, name, email };
                localStorage.setItem("user", JSON.stringify(updatedUser));
            } catch (e) {
                console.error(
                    "Erro ao atualizar dados do usuário no localStorage",
                    e
                );
            }
        }
    };

    if (isLoading) {
        return (
            <>
                <Sidebar />
                <div className="lg:ml-48 min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-4" />
                        <p className="text-zinc-400">Carregando perfil...</p>
                    </div>
                </div>
            </>
        );
    }

    console.log("Dados do usuário:", userData);

    const isAdmin = userData?.user?.role === "ADMIN";

    return (
        <>
            <Sidebar />
            <div className="lg:ml-48 min-h-screen relative p-8">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-red-900/20 to-rose-900/20 blur-3xl"></div>
                    <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-red-900/20 to-rose-900/20 blur-3xl"></div>
                </div>

                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                        backgroundSize: "30px 30px",
                    }}
                ></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center mb-8">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-white">
                                Configurações de perfil
                            </h1>
                        </div>
                    </div>

                    {isAdmin ? (
                        <Tabs defaultValue="profile" className="mb-6">
                            <TabsList className="bg-zinc-800 border border-zinc-700">
                                <TabsTrigger
                                    value="profile"
                                    className="data-[state=active]:bg-red-900 data-[state=active]:text-white"
                                >
                                    Perfil
                                </TabsTrigger>
                                <TabsTrigger
                                    value="create-user"
                                    className="data-[state=active]:bg-red-900 data-[state=active]:text-white"
                                >
                                    Criar Usuário
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <ProfileForm
                                    userData={userData}
                                    userId={userId}
                                    clientToken={clientToken}
                                    onProfileUpdated={handleProfileUpdated}
                                />
                            </TabsContent>

                            <TabsContent value="create-user">
                                <CreateUserForm clientToken={clientToken} />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <ProfileForm
                            userData={userData}
                            userId={userId}
                            clientToken={clientToken}
                            onProfileUpdated={handleProfileUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
