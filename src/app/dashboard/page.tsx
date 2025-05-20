import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cookies } from "next/headers"
import { getPaymentMetrics } from "@/actions/get-payments-metrics"
import Sidebar from "@/components/sidebar"
import { redirect } from "next/navigation"
import DashboardProducts from "@/components/dash-products"
import { getProducts } from "@/actions/get-product"
import { DashboardMetrics } from "@/components/dash-metrics"
import DashboardClients from "@/components/dash-clients"
import { getClients } from "@/actions/get-clients"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("client_token")?.value

  if (!token) {
    redirect("/")
  }

  const metrics = await getPaymentMetrics(token)
  const products = await getProducts({}, token)
  const clients = await getClients({}, token)

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-300">Erro ao carregar métricas</p>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <div className="lg:ml-48 min-h-screen p-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

          <Tabs defaultValue="metrics" className="mb-8">
            <TabsList className="bg-zinc-800 border border-zinc-700">
              <TabsTrigger value="metrics" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                Métricas
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                Produtos
              </TabsTrigger>
              <TabsTrigger value="clients" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                Clientes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
              <DashboardMetrics metrics={metrics} />
            </TabsContent>

            <TabsContent value="products">
              <DashboardProducts initialProducts={products.data || []} clientToken={token} />
            </TabsContent>

            <TabsContent value="clients">
              <DashboardClients initialClients={clients.data || []} clientToken={token} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
