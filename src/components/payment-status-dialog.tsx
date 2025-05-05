"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AlertCircle, Loader2, CalendarIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { updatePaymentStatus } from "@/actions/update-payment-status"
import type { Payment } from "@/actions/get-payments"

interface PaymentStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
  newStatus: "PAID" | "PENDING" | "DEFEATED"
  onSuccess: () => void
  clientToken?: string
}

export function PaymentStatusDialog({
  open,
  onOpenChange,
  payment,
  newStatus,
  onSuccess,
  clientToken,
}: PaymentStatusDialogProps) {
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(
    payment?.paymentDate ? new Date(payment.paymentDate) : new Date(),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStatusInfo = () => {
    switch (newStatus) {
      case "PAID":
        return {
          title: "Marcar como pago",
          description: "Confirme o pagamento e informe a data em que foi realizado.",
          icon: <CheckCircle className="h-5 w-5 mr-2 text-green-500" />,
          buttonText: "Confirmar pagamento",
          buttonClass: "bg-green-600 hover:bg-green-700",
        }
      case "PENDING":
        return {
          title: "Marcar como pendente",
          description: "Confirme que este pagamento está pendente.",
          icon: <Clock className="h-5 w-5 mr-2 text-yellow-500" />,
          buttonText: "Confirmar pendência",
          buttonClass: "bg-yellow-600 hover:bg-yellow-700",
        }
      case "DEFEATED":
        return {
          title: "Marcar como vencido",
          description: "Confirme que este pagamento está vencido.",
          icon: <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />,
          buttonText: "Confirmar vencimento",
          buttonClass: "bg-red-600 hover:bg-red-700",
        }
      default:
        return {
          title: "Atualizar status",
          description: "Confirme a atualização do status deste pagamento.",
          icon: null,
          buttonText: "Confirmar",
          buttonClass: "bg-red-600 hover:bg-red-700",
        }
    }
  }

  const statusInfo = getStatusInfo()

  const handleSubmit = async () => {
    if (!payment) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await updatePaymentStatus(
        payment.id,
        {
          paymentStatus: newStatus,
          paymentDate: newStatus === "PAID" && paymentDate ? paymentDate.toISOString() : undefined,
        },
        clientToken,
      )

      if (result.error) {
        setError(result.error)
      } else {
        onOpenChange(false)
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao atualizar o status do pagamento")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {statusInfo.icon}
            {statusInfo.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">{statusInfo.description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4 bg-red-950/50 border-red-900 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Apólice</p>
              <p className="text-white">{payment.policy?.name || "—"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Parcela</p>
              <p className="text-white">{payment.plot}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Valor</p>
              <p className="text-white">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(payment.price)}
              </p>
            </div>

            {newStatus === "PAID" && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-400">Data de Pagamento</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white",
                        !paymentDate && "text-zinc-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                      className="bg-zinc-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className={`text-white ${statusInfo.buttonClass}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              statusInfo.buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
