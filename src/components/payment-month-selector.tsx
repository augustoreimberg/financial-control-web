'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PaymentMonthSelectorProps {
  onMonthChange: (month: number, year: number) => void
}

export function PaymentMonthSelector({
  onMonthChange,
}: PaymentMonthSelectorProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => {
    const newDate = addMonths(currentDate, 1)
    setCurrentDate(newDate)
    onMonthChange(newDate.getMonth() + 1, newDate.getFullYear())
  }

  const prevMonth = () => {
    const newDate = subMonths(currentDate, 1)
    setCurrentDate(newDate)
    onMonthChange(newDate.getMonth() + 1, newDate.getFullYear())
  }

  useState(() => {
    onMonthChange(currentDate.getMonth() + 1, currentDate.getFullYear())
  })

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-xl font-semibold text-white capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>

        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
