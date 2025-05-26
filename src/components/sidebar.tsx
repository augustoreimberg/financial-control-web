"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import Cookies from "js-cookie";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [userInitial, setUserInitial] = useState("U");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const userJson = localStorage.getItem("user");
        if (userJson) {
            try {
                const user = JSON.parse(userJson);

                if (user.name) {
                    setUserName(user.name);
                    setUserInitial(user.name.charAt(0).toUpperCase());
                } else if (user.email) {
                    const firstName = user.email.split("@")[0].split(".")[0];
                    setUserName(
                        firstName.charAt(0).toUpperCase() + firstName.slice(1)
                    );
                    setUserInitial(firstName.charAt(0).toUpperCase());
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const handleLogout = async () => {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");

        Cookies.remove("client_token");

        await logout();

        router.push("/");
        router.refresh();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Apólices", href: "/policies", icon: Shield },
    ];

    return (
        <>
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleMobileMenu}
                    className="bg-zinc-900/90 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <div className="hidden lg:flex flex-col h-screen w-48 bg-zinc-900/90 backdrop-blur-xl border-r border-zinc-800 fixed">
                <div className="p-3 border-b border-zinc-800 flex justify-center">
                    <Image
                        src="/logo.svg"
                        alt="QWALLET Logo"
                        width={90}
                        height={90}
                        className="h-9"
                    />
                </div>

                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2.5 px-3 py-2 rounded-md transition-colors",
                                    pathname === item.href
                                        ? "bg-red-900/20 text-red-500"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                )}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/profile"
                            className={cn(
                                "flex items-center space-x-2.5 px-2 py-2 rounded-md transition-colors flex-1",
                                pathname === "/profile"
                                    ? "text-red-500"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <div className="h-6 w-6 rounded-full bg-red-800 flex items-center justify-center text-white font-medium text-sm">
                                {userInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium truncate">
                                    {userName || "Usuário"}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                    Ver perfil
                                </p>
                            </div>
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 h-7 w-7"
                            onClick={handleLogout}
                            title="Sair"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={toggleMobileMenu}
                    />

                    <div className="relative flex flex-col w-48 max-w-[80%] h-full bg-zinc-900 border-r border-zinc-800">
                        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                            <Image
                                src="/logo.svg"
                                alt="QWALLET Logo"
                                width={82}
                                height={82}
                                className="h-7"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMobileMenu}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-7 w-7"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center space-x-2.5 px-3 py-2 rounded-md transition-colors",
                                            pathname === item.href
                                                ? "bg-red-900/20 text-red-500"
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                        )}
                                        onClick={toggleMobileMenu}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm">
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-2 border-t border-zinc-800">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/profile"
                                    className={cn(
                                        "flex items-center space-x-2.5 px-2 py-2 rounded-md transition-colors flex-1",
                                        pathname === "/profile"
                                            ? "text-red-500"
                                            : "text-zinc-400 hover:text-white"
                                    )}
                                    onClick={toggleMobileMenu}
                                >
                                    <div className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center text-white font-medium text-sm">
                                        {userInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium truncate">
                                            {userName || "Usuário"}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                            Ver perfil
                                        </p>
                                    </div>
                                </Link>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 h-7 w-7"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
