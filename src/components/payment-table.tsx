"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Payment } from "@/actions/get-payments"

interface PaymentTableProps {
  payments: Payment[]
  onUpdateStatus: (payment: Payment, status: "PAID" | "PENDING" | "DEFEATED") => void
}

export function PaymentTable({ payments, onUpdateStatus }: PaymentTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return "Data inválida"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-800/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border-yellow-800/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "DEFEATED":
        return (
          <Badge className="bg-red-600/20 text-red-500 hover:bg-red-600/30 border-red-800/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        )
      default:
        return (
          <Badge className="bg-zinc-600/20 text-zinc-400 hover:bg-zinc-600/30 border-zinc-700/30">
            {status || "Desconhecido"}
          </Badge>
        )
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
            <TableHead className="text-zinc-400">Apólice</TableHead>
            <TableHead className="text-zinc-400">Cliente</TableHead>
            <TableHead className="text-zinc-400">Produto</TableHead>
            <TableHead className="text-zinc-400">Parcela</TableHead>
            <TableHead className="text-zinc-400">Valor</TableHead>
            <TableHead className="text-zinc-400">Vencimento</TableHead>
            <TableHead className="text-zinc-400">Status</TableHead>
            <TableHead className="text-zinc-400 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="border-zinc-800 hover:bg-zinc-800/50">
              <TableCell className="text-white font-medium">{payment.policy?.name || "—"}</TableCell>
              <TableCell className="text-zinc-300">{payment.policy?.client?.name || "—"}</TableCell>
              <TableCell className="text-zinc-300">{formatDate(payment.parentId)}</TableCell>
              <TableCell className="text-zinc-300">{payment.plot}</TableCell>
              <TableCell className="text-zinc-300">{formatCurrency(payment.price)}</TableCell>
              <TableCell className="text-zinc-300">{formatDate(payment.dueDate)}</TableCell>
              <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                    <DropdownMenuItem
                      className="hover:bg-zinc-700 cursor-pointer"
                      onClick={() => onUpdateStatus(payment, "PAID")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Marcar como pago
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-zinc-700 cursor-pointer"
                      onClick={() => onUpdateStatus(payment, "PENDING")}
                    >
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      Marcar como pendente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-zinc-700 cursor-pointer"
                      onClick={() => onUpdateStatus(payment, "DEFEATED")}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      Marcar como vencido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
