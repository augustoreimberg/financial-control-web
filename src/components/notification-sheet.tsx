"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Clock, Loader2, AlertCircle } from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getOverduePayments } from "@/actions/get-overdue-payments"
import { getUpcomingPayments } from "@/actions/get-upcoming-payments"
import type { Payment } from "@/actions/get-payments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Cookies from "js-cookie"

interface NotificationSheetProps {
  count?: number
  onSelectPolicy?: (policyId: string) => void
}

export function NotificationSheet({ onSelectPolicy }: NotificationSheetProps) {
  const [overduePayments, setOverduePayments] = useState<Payment[]>([])
  const [upcomingPayments, setUpcomingPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const totalNotifications = overduePayments.length + upcomingPayments.length

  const fetchNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = Cookies.get("client_token") || localStorage.getItem("accessToken")

      if (!token) {
        throw new Error("Token de autenticação não encontrado")
      }

      const [overdueResult, upcomingResult] = await Promise.all([getOverduePayments(token), getUpcomingPayments(token)])

      if (overdueResult.error) {
        throw new Error(overdueResult.error)
      }

      if (upcomingResult.error) {
        throw new Error(upcomingResult.error)
      }

      setOverduePayments(overdueResult.data || [])
      setUpcomingPayments(upcomingResult.data || [])
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar notificações")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    const intervalId = setInterval(
      () => {
        fetchNotifications()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return error instanceof Error ? error.message : "Data inválida"
    }
  }

  const handlePolicyClick = (payment: Payment) => {
    if (onSelectPolicy && payment.policyId) {
      onSelectPolicy(payment.policyId)
      setIsOpen(false)
    }
  }

  const renderPaymentItem = (payment: Payment, isOverdue: boolean) => (
    <div
      key={payment.id}
      className="p-3 rounded-md bg-zinc-800/70 border border-zinc-700 hover:border-red-800 cursor-pointer transition-colors mb-2"
      onClick={() => handlePolicyClick(payment)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-white">{payment.policyNumber}</div>
          <div className="text-xs text-zinc-400">Parcela: {payment.plot}</div>
          <div className="text-xs text-zinc-400">Vencimento: {formatDate(payment.dueDate)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-red-400">{formatCurrency(payment.price)}</div>
          <Badge
            className={
              isOverdue
                ? "bg-red-600/20 text-red-500 hover:bg-red-600/30 border-red-800/30 mt-1"
                : "bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border-yellow-800/30 mt-1"
            }
          >
            {isOverdue ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
            {isOverdue ? "Atrasado" : "Próximo"}
          </Badge>
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium flex items-center justify-center text-white transform translate-x-1/3 -translate-y-1/3">
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white">Notificações</SheetTitle>
          <SheetDescription className="text-zinc-400">Veja suas notificações de pagamentos.</SheetDescription>
        </SheetHeader>

        {error && (
          <Alert variant="destructive" className="mt-4 mb-2 bg-red-950/50 border-red-900 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="overdue" className="mt-6">
            <TabsList className="bg-zinc-800 border border-zinc-700 w-full">
              <TabsTrigger
                value="overdue"
                className="flex-1 data-[state=active]:bg-red-900 data-[state=active]:text-white"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Atrasados
                {overduePayments.length > 0 && (
                  <Badge className="ml-2 bg-red-600 text-white border-none">{overduePayments.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="flex-1 data-[state=active]:bg-red-900 data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Próximos
                {upcomingPayments.length > 0 && (
                  <Badge className="ml-2 bg-yellow-600 text-white border-none">{upcomingPayments.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overdue" className="mt-4 max-h-[500px] overflow-y-auto pr-1">
              {overduePayments.length > 0 ? (
                <div className="space-y-2">{overduePayments.map((payment) => renderPaymentItem(payment, true))}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-zinc-500">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-center">Nenhum pagamento atrasado.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4 max-h-[500px] overflow-y-auto pr-1">
              {upcomingPayments.length > 0 ? (
                <div className="space-y-2">{upcomingPayments.map((payment) => renderPaymentItem(payment, false))}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-zinc-500">
                  <Clock className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-center">Nenhum pagamento próximo do vencimento.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  )
}
