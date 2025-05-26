"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarIcon, ChevronDown, ChevronUp } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Payment } from "@/actions/get-payments"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface PolicyCalendarProps {
  payments?: Payment[]
  onSelectPayment?: (payment: Payment) => void
}

export function PolicyCalendar({ payments = [], onSelectPayment }: PolicyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({})

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const toggleDay = (dateString: string) => {
    setOpenDays((prev) => ({
      ...prev,
      [dateString]: !prev[dateString],
    }))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const paymentsByDay = daysInMonth.map((day) => {
    const dayPayments = payments.filter((payment) => {
      try {
        const dueDate = new Date(payment.dueDate)
        return isSameDay(dueDate, day)
      } catch (error) {
        console.error("Erro ao comparar datas:", error)
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
        {paymentsByDay.map(({ date, payments }) => {
          const dateString = date.toISOString()
          const hasMultiplePayments = payments.length > 1
          const isOpen = openDays[dateString] || false

          return (
            <Card
              key={dateString}
              className={`border-zinc-800 ${
                payments.length > 0 ? "bg-zinc-900/90" : "bg-zinc-900/50"
              } backdrop-blur-xl shadow-xl ${isOpen ? "h-auto" : "h-[160px]"} transition-all duration-300`}
            >
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-zinc-400" />
                    <span className="text-white font-medium">{format(date, "dd", { locale: ptBR })}</span>
                    {hasMultiplePayments && (
                      <Badge className="ml-2 bg-red-900/30 text-red-400 border-red-800/50">{payments.length}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{format(date, "EEEE", { locale: ptBR })}</span>
                </div>

                {payments.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Nenhum pagamento</div>
                ) : hasMultiplePayments ? (
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => toggleDay(dateString)}
                    className="flex-1 flex flex-col"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex-1 flex flex-col justify-center cursor-pointer hover:bg-zinc-800/50 rounded-md p-2 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-300">{payments.length} pagamentos</span>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                        {!isOpen && (
                          <div className="mt-2 text-xs text-zinc-500">Clique para ver todos os pagamentos</div>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-2 rounded-md bg-zinc-800/70 border border-zinc-700 hover:border-red-800 cursor-pointer transition-colors"
                          onClick={() => onSelectPayment && onSelectPayment(payment)}
                        >
                          <div className="text-sm font-medium text-white">{payment.policyNumber || "—"}</div>
                          <div className="text-xs text-zinc-400">{payment.plot}</div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs">{getStatusBadge(payment.paymentStatus)}</span>
                            <span className="text-xs font-medium text-red-400">{formatCurrency(payment.price)}</span>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <div
                    className="flex-1 p-2 rounded-md bg-zinc-800/70 border border-zinc-700 hover:border-red-800 cursor-pointer transition-colors"
                    onClick={() => onSelectPayment && onSelectPayment(payments[0])}
                  >
                    <div className="text-sm font-medium text-white">{payments[0].policyNumber || "—"}</div>
                    <div className="text-xs text-zinc-400">{payments[0].plot}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs">{getStatusBadge(payments[0].paymentStatus)}</span>
                      <span className="text-xs font-medium text-red-400">{formatCurrency(payments[0].price)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
