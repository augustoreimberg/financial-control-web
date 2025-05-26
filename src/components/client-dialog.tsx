"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, UserPlus, PenSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Client } from "@/actions/get-clients";
import { createClient } from "@/actions/create-client";
import { updateClient } from "@/actions/update-client";
import { getUsers, type User } from "@/actions/get-users-by-role";

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: Client | null;
    onSuccess: () => void;
    clientToken?: string;
}

export function ClientDialog({
    open,
    onOpenChange,
    client,
    onSuccess,
    clientToken,
}: ClientDialogProps) {
    const [form, setForm] = useState<{
        name: string;
        email: string;
        sinacorCode: string;
        accountNumber: string;
        advisorId: string;
        brokerId: string;
    }>({
        name: client?.name || "",
        email: client?.email || "",
        sinacorCode: client?.sinacorCode || "",
        accountNumber: client?.accountNumber || "",
        advisorId: "",
        brokerId: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!client;

    const [advisors, setAdvisors] = useState<User[]>([]);
    const [brokers, setBrokers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        if (client && open) {
            setForm({
                name: client.name || "",
                email: client.email || "",
                sinacorCode: client.sinacorCode || "",
                accountNumber: client.accountNumber || "",
                advisorId: "",
                brokerId: "",
            });
        } else if (!isEditing && open) {
            setForm({
                name: "",
                email: "",
                sinacorCode: "",
                accountNumber: "",
                advisorId: "",
                brokerId: "",
            });
        }
    }, [client, open, isEditing]);

    useEffect(() => {
        if (!isEditing && open) {
            setIsLoadingUsers(true);
            Promise.all([
                getUsers({ role: "ADVISOR" }, clientToken),
                getUsers({ role: "BROKER" }, clientToken),
            ])
                .then(([advisorsRes, brokersRes]) => {
                    if (!advisorsRes.error) setAdvisors(advisorsRes.data || []);
                    if (!brokersRes.error) setBrokers(brokersRes.data || []);
                })
                .finally(() => setIsLoadingUsers(false));
        }
    }, [open, isEditing, clientToken]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("sinacorCode", form.sinacorCode);
            formData.append("accountNumber", form.accountNumber);

            if (!isEditing) {
                formData.append("advisorId", form.advisorId);
                formData.append("brokerId", form.brokerId);
            }

            let result;
            if (isEditing && client?.id) {
                formData.append("id", client.id);
                result = await updateClient(formData, clientToken);
            } else {
                result = await createClient(formData, clientToken);
            }

            if (result.error) {
                setError(result.error);
            } else {
                onOpenChange(false);
                onSuccess();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao processar a solicitação"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] bg-zinc-900 border-zinc-800 text-white shadow-xl rounded-xl p-6">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="space-y-2 mb-4">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <div className="text-red-500 bg-red-500/10 p-2 rounded-lg">
                                        <PenSquare className="h-5 w-5" />
                                    </div>
                                    Editar Cliente
                                </>
                            ) : (
                                <>
                                    <div className="text-red-500 bg-red-500/10 p-2 rounded-lg">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    Novo Cliente
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-base">
                            {isEditing
                                ? "Atualize os dados do cliente abaixo."
                                : "Preencha os dados para cadastrar um novo cliente."}
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <Alert
                            variant="destructive"
                            className="mt-4 bg-red-950/50 border-red-900 text-red-200 rounded-lg"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-5 py-4">
                        {["name", "email", "sinacorCode", "accountNumber"].map(
                            (id) => (
                                <div
                                    key={id}
                                    className="grid grid-cols-4 items-center gap-4"
                                >
                                    <Label
                                        htmlFor={id}
                                        className="text-right text-zinc-400 font-medium"
                                    >
                                        {id === "name"
                                            ? "Nome"
                                            : id === "email"
                                            ? "Email"
                                            : id === "sinacorCode"
                                            ? "Sinacor"
                                            : "Conta"}
                                    </Label>
                                    <Input
                                        id={id}
                                        name={id}
                                        value={form[id as keyof typeof form]}
                                        onChange={handleChange}
                                        required
                                        className="col-span-3 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500 focus-visible:border-red-400 transition-all"
                                        placeholder={
                                            id === "name"
                                                ? "Nome do cliente"
                                                : id === "email"
                                                ? "email@exemplo.com"
                                                : id === "sinacorCode"
                                                ? "Sinacor"
                                                : "Conta"
                                        }
                                    />
                                </div>
                            )
                        )}

                        {!isEditing && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="advisorId"
                                        className="text-right text-zinc-400"
                                    >
                                        Assessor
                                    </Label>
                                    <select
                                        id="advisorId"
                                        name="advisorId"
                                        value={form.advisorId}
                                        onChange={handleChange}
                                        required
                                        className="col-span-3 bg-zinc-800/50 border border-zinc-700 text-white p-2 rounded-md focus:ring-red-500 focus:border-red-400 outline-none transition-all"
                                    >
                                        <option value="">
                                            Selecione um Assessor
                                        </option>
                                        {advisors.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="brokerId"
                                        className="text-right text-zinc-400"
                                    >
                                        Corretor
                                    </Label>
                                    <select
                                        id="brokerId"
                                        name="brokerId"
                                        value={form.brokerId}
                                        onChange={handleChange}
                                        required
                                        className="col-span-3 bg-zinc-800/50 border border-zinc-700 text-white p-2 rounded-md focus:ring-red-500 focus:border-red-400 outline-none transition-all"
                                    >
                                        <option value="">
                                            Selecione um Corretor
                                        </option>
                                        {brokers.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {isLoadingUsers && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                            <span className="ml-2 text-zinc-400">
                                Carregando usuários...
                            </span>
                        </div>
                    )}

                    <DialogFooter className="gap-2 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                            disabled={isSubmitting || isLoadingUsers}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditing ? "Salvando..." : "Criando..."}
                                </>
                            ) : isEditing ? (
                                "Salvar alterações"
                            ) : (
                                "Criar cliente"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
