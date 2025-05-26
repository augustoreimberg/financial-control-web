'use client'

import type React from 'react'

import { useMemo, useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  ArrowBigLeft,
  ArrowBigRight,
  Pen,
} from 'lucide-react'
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Payment } from '@/actions/get-payments'
import { EditDueDateModal } from './edit-payment-modal'
import { getClients } from '@/actions/get-clients'

interface PaymentTableProps {
  payments: Payment[]
  onUpdateStatus: (
    payment: Payment,
    status: 'PAID' | 'PENDING' | 'DEFEATED'
  ) => void
  selectedPolicy?: string | null
  onSelectPolicy?: (policyId: string | null) => void
}

export function PaymentTable({
  payments,
  onUpdateStatus,
  selectedPolicy = null,
  onSelectPolicy = () => {},
}: PaymentTableProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [clientDetails, setClientDetails] = useState<{
    advisor: string
    broker: string
  } | null>(null)
  const [isLoadingClient, setIsLoadingClient] = useState(false)

  useEffect(() => {
    if (selectedPolicy) {
      setDialogOpen(true)

      const selectedPaymentData = payments.find(
        (p) => p.policyId === selectedPolicy
      )

      if (selectedPaymentData?.accountId) {
        setIsLoadingClient(true)
        getClients({ id: selectedPaymentData.accountId })
          .then((response) => {
            console.log('Responseeee', response.data)
            if (response.data && response.data.length > 0) {
              const client = response.data[0]
              const advisor =
                client.users.find((user) => user.role === 'ADVISOR') || null
              const broker =
                client.users.find((user) => user.role === 'BROKER') || null

              setClientDetails({
                advisor: advisor?.name ?? '',
                broker: broker?.name ?? '',
              })
            } else {
              setClientDetails(null)
            }
          })
          .catch((error) => {
            console.error('Error fetching client details:', error)
            setClientDetails(null)
          })
          .finally(() => {
            setIsLoadingClient(false)
          })
      }
    }
  }, [selectedPolicy, payments])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open && onSelectPolicy) {
      onSelectPolicy(null)
    }
  }
  console.log('Payments:', payments)

  const handleEditPayment = (payment: Payment, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPayment(payment)
    setEditModalOpen(true)
  }

  const handlePaymentUpdated = (updatedPayment: Payment) => {
    console.log('Payment updated:', updatedPayment)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-800/30">
            <CheckCircle className="h-3 w-3 mr-1" /> Pago
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border-yellow-800/30">
            <Clock className="h-3 w-3 mr-1" /> Pendente
          </Badge>
        )
      case 'DEFEATED':
        return (
          <Badge className="bg-red-600/20 text-red-500 hover:bg-red-600/30 border-red-800/30">
            <AlertTriangle className="h-3 w-3 mr-1" /> Vencido
          </Badge>
        )
      default:
        return (
          <Badge className="bg-zinc-600/20 text-zinc-400 hover:bg-zinc-600/30 border-zinc-700/30">
            {status || 'Desconhecido'}
          </Badge>
        )
    }
  }

  const filteredPayments = useMemo(
    () =>
      payments.filter((p) => {
        const due = parseISO(p.dueDate)
        return isWithinInterval(due, {
          start: startOfMonth(selectedMonth),
          end: endOfMonth(selectedMonth),
        })
      }),
    [payments, selectedMonth]
  )

  const paymentsByPolicy = useMemo(
    () => payments.filter((p) => p.policyId === selectedPolicy),
    [payments, selectedPolicy]
  )

  return (
    <div className="overflow-x-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          className="text-sm bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={() => setSelectedMonth((prev) => subMonths(prev, 1))}
        >
          <ArrowBigLeft />
          Mês Anterior
        </Button>

        <span className="text-base font-semibold text-white">
          {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>

        <Button
          variant="outline"
          className="text-sm bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={() => setSelectedMonth((prev) => addMonths(prev, 1))}
        >
          Próximo Mês
          <ArrowBigRight />
        </Button>
      </div>

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
            <TableHead className="text-zinc-400 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPayments.map((payment) => (
            <TableRow
              key={payment.id}
              className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50"
              onClick={() => onSelectPolicy(payment.policyId)}
            >
              <TableCell className="text-white font-medium">
                {payment.policyNumber}
              </TableCell>
              <TableCell className="text-zinc-300">
                {payment.accountName}
              </TableCell>
              <TableCell className="text-zinc-300">
                {payment.productName}
              </TableCell>
              <TableCell className="text-zinc-300">{payment.plot}</TableCell>
              <TableCell className="text-zinc-300">
                {formatCurrency(payment.price)}
              </TableCell>
              <TableCell className="text-zinc-300">
                {formatDate(payment.dueDate)}
              </TableCell>
              <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
              <TableCell
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white mr-2"
                  onClick={(e) => handleEditPayment(payment, e)}
                >
                  <Pen className="h-4 w-4" />
                  <span className="sr-only">Editar data de vencimento</span>
                </Button>
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
                  <DropdownMenuContent
                    align="end"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  >
                    <DropdownMenuItem
                      className="hover:bg-zinc-700 cursor-pointer"
                      onClick={() => onUpdateStatus(payment, 'PAID')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Marcar como pago
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-zinc-700 cursor-pointer"
                      onClick={() => onUpdateStatus(payment, 'PENDING')}
                    >
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      Marcar como pendente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-zinc-700 cursor-pointer"
                      onClick={() => onUpdateStatus(payment, 'DEFEATED')}
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-zinc-900 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Apólice</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full mt-4">
            <TabsList className="bg-zinc-900 border border-zinc-700 mb-4 rounded-md p-1">
              <TabsTrigger
                value="info"
                className="text-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-300 px-4 py-1 rounded-md"
              >
                Informações
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="text-sm data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-300 px-4 py-1 rounded-md"
              >
                Pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              {paymentsByPolicy.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Número da Apólice</p>
                      <p className="font-medium">
                        {paymentsByPolicy[0].policyNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Cliente</p>
                      <p className="font-medium">
                        {paymentsByPolicy[0].accountName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Produto</p>
                      <p className="font-medium">
                        {paymentsByPolicy[0].productName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Total de Parcelas</p>
                      <p className="font-medium">{paymentsByPolicy.length}</p>
                    </div>
                  </div>

                  {isLoadingClient ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-zinc-400"></div>
                    </div>
                  ) : clientDetails ? (
                    <div className="space-y-4 mt-6 border-t border-zinc-700 pt-4">
                      <h3 className="text-base font-medium">Responsáveis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-zinc-400">Assessor</p>
                          {clientDetails.advisor ? (
                            <div>
                              <p className="font-medium">
                                {clientDetails.advisor}
                              </p>
                            </div>
                          ) : (
                            <p className="text-zinc-400 italic">
                              Não atribuído
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">Corretor</p>
                          {clientDetails.broker ? (
                            <div>
                              <p className="font-medium">
                                {clientDetails.broker}
                              </p>
                            </div>
                          ) : (
                            <p className="text-zinc-400 italic">
                              Não atribuído
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-zinc-400">
                  <p className="italic">Nenhuma informação disponível ainda.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments">
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {paymentsByPolicy.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between border-b border-zinc-700 py-2"
                  >
                    <div>
                      <p className="font-medium">{p.plot}</p>
                      <p className="text-sm text-zinc-400">
                        vencimento: {formatDate(p.dueDate)}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {p.paymentStatus === 'PAID' && p.paymentDate
                          ? `pagamento: ${formatDate(p.paymentDate)}`
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-0 h-auto w-auto bg-transparent border-transparent hover:bg-zinc-700"
                            >
                              {getStatusBadge(p.paymentStatus)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-zinc-800 border-zinc-700 text-white"
                          >
                            <DropdownMenuItem
                              className="hover:bg-zinc-700 cursor-pointer"
                              onClick={() => onUpdateStatus(p, 'PAID')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Marcar como pago
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-zinc-700 cursor-pointer"
                              onClick={() => onUpdateStatus(p, 'PENDING')}
                            >
                              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                              Marcar como pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="hover:bg-zinc-700 cursor-pointer"
                              onClick={() => onUpdateStatus(p, 'DEFEATED')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                              Marcar como vencido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm">{formatCurrency(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <EditDueDateModal
        payment={selectedPayment}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handlePaymentUpdated}
      />
    </div>
  )
}
