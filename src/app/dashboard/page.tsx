import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart as PieChartIcon } from "lucide-react"
import { cookies } from "next/headers"
import { getPaymentMetrics } from "@/actions/get-payments-metrics"
import Sidebar from "@/components/sidebar"
import DashboardChart from "@/components/dashboard-chart"
import { redirect } from "next/navigation"

const COLORS = ["#10B981", "#FBBF24", "#EF4444"]

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("client_token")?.value

  if (!token) {
    redirect("/")
  }

  const metrics = await getPaymentMetrics(token)

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-300">Erro ao carregar métricas</p>
      </div>
    )
  }

  const chartData = [
    { name: "Pago", value: metrics.statuses.paid, color: COLORS[0] },
    { name: "Pendente", value: metrics.statuses.pending, color: COLORS[1] },
    { name: "Falhou", value: metrics.statuses.defeated, color: COLORS[2] },
  ]

  return (
    <>
      <Sidebar />
      <div className="lg:ml-48 min-h-screen p-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="bg-zinc-800 border border-zinc-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                Visão Geral
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-red-500" />
                    Distribuição de Pagamentos
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Status atual dos pagamentos</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center space-y-6">
                  <DashboardChart data={chartData} total={metrics.total} />

                  <div className="w-full text-right mt-4 text-sm text-zinc-400">
                    Total de pagamentos:{" "}
                    <span className="text-white font-semibold">{metrics.total}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
