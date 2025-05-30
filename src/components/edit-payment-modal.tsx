"use client";

import { useState } from "react";
import {
    format,
    parseISO,
    setDate,
    setHours,
    setMinutes,
    setSeconds,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, Calendar as CalendarIcon } from "lucide-react";
import { updatePaymentDueDate } from "@/actions/update-payment";
import type { Payment } from "@/actions/get-payments";
import Cookies from "js-cookie";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface EditDueDateModalProps {
    payment: Payment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (updatedPayment: Payment) => void;
}

export function EditDueDateModal({
    payment,
    open,
    onOpenChange,
    onSuccess,
}: EditDueDateModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        undefined
    );
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    if (!payment) return null;

    const currentDueDate = parseISO(payment.dueDate);

    const createNewDueDate = (day: number) => {
        const newDate = setDate(currentDueDate, day);
        return setSeconds(setMinutes(setHours(newDate, 3), 0), 0);
    };

    const handleDaySelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            setShowConfirmation(true);
            setShowCalendar(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedDate || !payment) return;

        setIsLoading(true);
        setError(null);

        try {
            const newDueDate = createNewDueDate(selectedDate.getDate());
            const formattedDate = newDueDate.toISOString();
            const clientToken = Cookies.get("client_token");

            const result = await updatePaymentDueDate(
                payment.id,
                formattedDate,
                clientToken
            );

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                if (onSuccess) onSuccess(result.data);
                onOpenChange(false);
                window.location.reload();
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao atualizar data de vencimento"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const disableDate = (date: Date) => {
        return (
            date.getMonth() !== currentDueDate.getMonth() ||
            date.getFullYear() !== currentDueDate.getFullYear()
        );
    };

    const resetModal = () => {
        setSelectedDate(undefined);
        setShowConfirmation(false);
        setError(null);
        setShowCalendar(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetModal();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="bg-zinc-900 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>Alterar Data de Vencimento</DialogTitle>
                </DialogHeader>

                <Alert
                    variant="destructive"
                    className="bg-amber-950/30 border-amber-800/50 text-amber-300"
                >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                        Esta alteração afetará as datas dos próximos pagamentos
                        desta apólice.
                    </AlertDescription>
                </Alert>

                <div className="py-4">
                    <div className="justify-start gap-x-8 mb-4">
                        <div>
                            <p className="text-sm text-zinc-400">Parcela</p>
                            <p className="font-medium">{payment.plot}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div>
                                <p className="text-sm text-zinc-400">
                                    Data de vencimento atual
                                </p>
                                <p className="font-medium">
                                    {format(
                                        currentDueDate,
                                        "dd 'de' MMMM 'de' yyyy",
                                        { locale: ptBR }
                                    )}
                                </p>
                            </div>
                            <Popover
                                open={showCalendar}
                                onOpenChange={setShowCalendar}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="p-0 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        Nova data
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-zinc-800 border-zinc-700"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={
                                            selectedDate || currentDueDate
                                        }
                                        onSelect={handleDaySelect}
                                        disabled={disableDate}
                                        defaultMonth={currentDueDate}
                                        disableNavigation
                                        className="bg-zinc-800 border border-zinc-700 rounded-md text-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {showConfirmation ? (
                        <div className="mb-4">
                            <Alert className="bg-zinc-800 border-zinc-700 mb-4">
                                <Check className="h-4 w-4 text-green-500" />
                                <AlertTitle>Confirmar alteração</AlertTitle>
                                <AlertDescription>
                                    Alterar a data de vencimento para{" "}
                                    {selectedDate &&
                                        format(
                                            selectedDate,
                                            "dd 'de' MMMM 'de' yyyy",
                                            { locale: ptBR }
                                        )}
                                    ?
                                </AlertDescription>
                            </Alert>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmation(false)}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                                >
                                    Voltar
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className="bg-green-700 hover:bg-green-600 text-white"
                                >
                                    {isLoading ? "Processando..." : "Confirmar"}
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                    >
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
