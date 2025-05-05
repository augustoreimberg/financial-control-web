"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from "@/components/sidebar"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { getPaymentMetrics } from "@/actions/get-payments-metrics"
import { Loader2, PieChart as PieChartIcon } from "lucide-react"

const COLORS = ["#10B981", "#FBBF24", "#EF4444"]

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const user = localStorage.getItem("user")
      const token = localStorage.getItem("accessToken")
      const cookieToken = Cookies.get("client_token")

      if (!user || (!token && !cookieToken)) {
        router.push("/")
        return
      }

      const data = await getPaymentMetrics(cookieToken || undefined)
      if (data) {
        const transformed = [
          { name: "Pago", value: data.statuses.paid, color: COLORS[0] },
          { name: "Pendente", value: data.statuses.pending, color: COLORS[1] },
          { name: "Falhou", value: data.statuses.defeated, color: COLORS[2] },
        ]
        setChartData(transformed)
        setTotal(data.total)
      }

      setIsLoading(false)
    }

    checkAuthAndLoadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <div className="lg:ml-48 min-h-screen p-8 overflow-hidden">
        <div className="max-w-3xl mx-auto">
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

                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  {/* Gráfico */}
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legenda horizontal */}
                  <div className="flex justify-center gap-6 mt-2 flex-wrap">
                    {chartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-white">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-zinc-300">{entry.name}:</span>
                        <span className="font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="w-full text-right mt-2 text-sm text-zinc-400">
                    Total de pagamentos: <span className="text-white font-semibold">{total}</span>
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
