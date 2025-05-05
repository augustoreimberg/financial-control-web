"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Client } from "@/actions/get-clients"
import type { Product } from "@/actions/get-product"

interface PolicyFiltersProps {
  clients: Client[]
  products: Product[]
  onFilter: (filters: PolicyFilters) => void
}

export interface PolicyFilters {
  policyNumber?: string
  clientId?: string
  productId?: string
  month?: number
  year?: number
  dueDate?: Date
}

export function PolicyFilters({ clients, products, onFilter }: PolicyFiltersProps) {
  const [filters, setFilters] = useState<PolicyFilters>({})
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  const handleFilterChange = (key: keyof PolicyFilters, value: string | number | Date | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value }

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
          <Label htmlFor="policyNumber" className="text-zinc-400">
            Número da Apólice
          </Label>
          <Input
            id="policyNumber"
            placeholder="Buscar por número"
            value={filters.policyNumber || ""}
            onChange={(e) => handleFilterChange("policyNumber", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client" className="text-zinc-400">
            Cliente
          </Label>
          <Select value={filters.clientId} onValueChange={(value) => handleFilterChange("clientId", value)}>
            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product" className="text-zinc-400">
            Produto
          </Label>
          <Select value={filters.productId} onValueChange={(value) => handleFilterChange("productId", value)}>
            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">Todos os produtos</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
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
