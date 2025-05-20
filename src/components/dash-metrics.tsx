import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "lucide-react"

interface MetricsData {
  statuses: {
    paid: number
    pending: number
    defeated: number
  }
  total: number
}

interface DashboardMetricsProps {
  metrics: MetricsData
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const paidPercentage = Math.round((metrics.statuses.paid / metrics.total) * 100) || 0
  const pendingPercentage = Math.round((metrics.statuses.pending / metrics.total) * 100) || 0
  const failedPercentage = Math.round((metrics.statuses.defeated / metrics.total) * 100) || 0

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center pt-2">
          <PieChart className="mr-2 h-6 w-6 text-red-500" />
          Métricas de Pagamentos
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Pagamentos Aprovados"
          value={metrics.statuses.paid}
          percentage={paidPercentage}
          color="bg-emerald-500"
          textColor="text-emerald-500"
        />
        <StatusCard
          title="Pagamentos Pendentes"
          value={metrics.statuses.pending}
          percentage={pendingPercentage}
          color="bg-amber-500"
          textColor="text-amber-500"
        />
        <StatusCard
          title="Pagamentos Falhos"
          value={metrics.statuses.defeated}
          percentage={failedPercentage}
          color="bg-red-500"
          textColor="text-red-500"
        />
      </div>

      <div className="text-right mt-4 text-sm text-zinc-400">
        Total de pagamentos: <span className="text-white font-semibold">{metrics.total}</span>
      </div>
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: number
  percentage: number
  color: string
  textColor: string
}

function StatusCard({ title, value, percentage, color }: StatusCardProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${color} text-white`}>
            {percentage}%
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}
