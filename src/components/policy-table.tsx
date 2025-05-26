'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Policy } from '@/actions/create-policy'

interface PolicyTableProps {
  policies: Policy[]
  onEdit: (policy: Policy) => void
  onDelete: (policy: Policy) => void
}

export function PolicyTable({ policies, onEdit, onDelete }: PolicyTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch (error) {
      return error instanceof Error ? error.message : 'Data inválida'
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'MONTHLY':
        return 'Mensal'
      case 'ANNUAL':
        return 'Anual'
      default:
        return frequency
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
            <TableHead className="text-zinc-400">Número</TableHead>
            <TableHead className="text-zinc-400">Nome</TableHead>
            <TableHead className="text-zinc-400">Cliente</TableHead>
            <TableHead className="text-zinc-400">Produto</TableHead>
            <TableHead className="text-zinc-400">Frequência</TableHead>
            <TableHead className="text-zinc-400">Prêmio</TableHead>
            <TableHead className="text-zinc-400">Vencimento</TableHead>
            <TableHead className="text-zinc-400 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow
              key={policy.id}
              className="border-zinc-800 hover:bg-zinc-800/50"
            >
              <TableCell className="text-zinc-300 font-mono text-xs">
                {policy.policyNumber}
              </TableCell>
              <TableCell className="text-white font-medium">
                {policy.name}
              </TableCell>
              <TableCell className="text-zinc-300">—</TableCell>
              <TableCell className="text-zinc-300">—</TableCell>
              <TableCell className="text-zinc-300">
                {getFrequencyLabel(policy.frequency)}
              </TableCell>
              <TableCell className="text-zinc-300">
                {policy.frequency === 'MONTHLY'
                  ? formatCurrency(policy.monthlyPremium)
                  : formatCurrency(policy.annualPremium || 0)}
              </TableCell>
              <TableCell className="text-zinc-300">
                {formatDate(policy.dueDate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    onClick={() => onEdit(policy)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent border-zinc-700 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-800"
                    onClick={() => onDelete(policy)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
