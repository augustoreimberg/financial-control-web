import type React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  PieChartIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import DashboardChart from '@/components/dashboard-chart'

interface ChartDataItem {
  name: string
  value: number
  color: string
}

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
  const chartData = [
    { name: 'Pagos', value: metrics.statuses.paid, color: '#10B981' },
    { name: 'Pendentes', value: metrics.statuses.pending, color: '#FBBF24' },
    { name: 'Atrasados', value: metrics.statuses.defeated, color: '#EF4444' },
  ]

  const paidPercentage =
    Math.round((metrics.statuses.paid / metrics.total) * 100) || 0
  const pendingPercentage =
    Math.round((metrics.statuses.pending / metrics.total) * 100) || 0
  const failedPercentage =
    Math.round((metrics.statuses.defeated / metrics.total) * 100) || 0

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-red-500" />
            Distribuição de Pagamentos
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Status atual dos pagamentos
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-6">
          <DashboardChart data={chartData} total={metrics.total} />

          <div className="w-full text-right mt-4 text-sm text-zinc-400">
            Total de pagamentos:{' '}
            <span className="text-white font-semibold">{metrics.total}</span>
          </div>
        </CardContent>
      </Card>

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
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${color} text-white`}
          >
            {percentage}%
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
