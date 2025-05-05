"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Policy } from "@/actions/create-policy"
import type { Payment } from "@/actions/get-payments"
import { Badge } from "@/components/ui/badge"

interface PolicyCalendarProps {
  policies: Policy[]
  onSelectPolicy: (policy: Policy) => void
  payments?: Payment[]
  onSelectPayment?: (payment: Payment) => void
}

export function PolicyCalendar({ policies, onSelectPolicy, payments = [], onSelectPayment }: PolicyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Agrupar pagamentos por dia de vencimento
  const paymentsByDay = daysInMonth.map((day) => {
    const dayPayments = payments.filter((payment) => {
      try {
        const dueDate = new Date(payment.dueDate)
        return isSameDay(dueDate, day)
      } catch (error) {
        return false
      }
    })

    return {
      date: day,
      payments: dayPayments,
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-600/20 text-green-500 border-green-800/30">Pago</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-600/20 text-yellow-500 border-yellow-800/30">Pendente</Badge>
      case "DEFEATED":
        return <Badge className="bg-red-600/20 text-red-500 border-red-800/30">Vencido</Badge>
      default:
        return <Badge className="bg-zinc-600/20 text-zinc-400 border-zinc-700/30">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paymentsByDay.map(({ date, payments }) => (
          <Card
            key={date.toISOString()}
            className={`border-zinc-800 ${
              payments.length > 0 ? "bg-zinc-900/90" : "bg-zinc-900/50"
            } backdrop-blur-xl shadow-xl`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-zinc-400" />
                  <span className="text-white font-medium">{format(date, "dd", { locale: ptBR })}</span>
                </div>
                <span className="text-xs text-zinc-500">{format(date, "EEEE", { locale: ptBR })}</span>
              </div>

              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-2 rounded-md bg-zinc-800/70 border border-zinc-700 hover:border-red-800 cursor-pointer transition-colors"
                      onClick={() => onSelectPayment && onSelectPayment(payment)}
                    >
                      <div className="text-sm font-medium text-white">{payment.policy?.name || "—"}</div>
                      <div className="text-xs text-zinc-400">{payment.plot}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs">{getStatusBadge(payment.paymentStatus)}</span>
                        <span className="text-xs font-medium text-red-400">{formatCurrency(payment.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-zinc-500 text-sm">Nenhum pagamento</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
