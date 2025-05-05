"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Policy } from "@/actions/get-policies"

interface PaymentFiltersProps {
  policies: Policy[]
  onFilter: (filters: PaymentFilters) => void
}

export interface PaymentFilters {
  policyId?: string
  status?: "PAID" | "PENDING" | "DEFEATED"
  month?: number
  year?: number
  dueDate?: Date
}

export function PaymentFilters({ policies, onFilter }: PaymentFiltersProps) {
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  const handleFilterChange = (key: keyof PaymentFilters, value: string | number | Date | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value }

      // Se o valor for vazio, remova a propriedade
      if (value === "" || value === undefined) {
        delete newFilters[key]
      }

      return newFilters
    })
  }

  const handleApplyFilters = () => {
    onFilter(filters)
  }

  const handleClearFilters = () => {
    setFilters({})
    setDueDate(undefined)
    onFilter({})
  }

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="policy" className="text-zinc-400">
            Apólice
          </Label>
          <Select value={filters.policyId} onValueChange={(value) => handleFilterChange("policyId", value)}>
            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
              <SelectValue placeholder="Selecione uma apólice" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todas as apólices</SelectItem>
              {policies.map((policy) => (
                <SelectItem key={policy.id} value={policy.id}>
                  {policy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-zinc-400">
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value: "PAID" | "PENDING" | "DEFEATED" | undefined) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="DEFEATED">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month" className="text-zinc-400">
            Mês
          </Label>
          <Select
            value={filters.month?.toString()}
            onValueChange={(value) => handleFilterChange("month", value === "all" ? undefined : Number(value))}
          >
            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
              <SelectValue placeholder="Selecione um mês" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todos os meses</SelectItem>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-zinc-400">
            Data de Vencimento
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dueDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white",
                  !dueDate && "text-zinc-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date)
                  handleFilterChange("dueDate", date)
                }}
                initialFocus
                className="bg-zinc-800 text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
        <Button onClick={handleApplyFilters} className="bg-red-600 hover:bg-red-700">
          <Search className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )
}
