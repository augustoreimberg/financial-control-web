"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"


export interface PaymentsFilters {
  search?: string
  clientId?: string
  productId?: string
  month?: number
  year?: number
  dueDate?: string
  status?: "PAID" | "PENDING" | "DEFEATED"
}

interface PaymentsFiltersProps {
  onFilter: (filters: PaymentsFilters) => void
}

export function PaymentsFilters({ onFilter }: PaymentsFiltersProps) {
  const [filters, setFilters] = useState<PaymentsFilters>({})


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const newFilters = { ...filters, search: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }


  

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
        <Input
          placeholder="Buscar por número da apólice, cliente ou produto..."
          value={filters.search || ""}
          onChange={handleSearch}
          className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-zinc-400 hover:text-white"
            onClick={() => {
              const newFilters = { ...filters, search: "" }
              setFilters(newFilters)
              onFilter(newFilters)
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>
    </div>
  )
}
