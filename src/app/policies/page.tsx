"use client"

// Modificar a página de policies para usar as actions de pagamentos
// Substituir as importações de policies por pagamentos
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, CalendarIcon, ListIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { getPayments, type Payment } from "@/actions/get-payments"
import { getClients, type Client } from "@/actions/get-clients"
import { getProducts, type Product } from "@/actions/get-product"
import { PolicyFilters, type PolicyFilters as PolicyFiltersType } from "@/components/policy-filters"
import { PaymentTable } from "@/components/payment-table"
import { PolicyCalendar } from "@/components/policy-calendar"
import { PaymentStatusDialog } from "@/components/payment-status-dialog"
import { NotificationSheet } from "@/components/notification-sheet"

export default function PoliciesPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientToken, setClientToken] = useState<string | undefined>(undefined)
  const [activeView, setActiveView] = useState<"list" | "calendar">("list")
  const router = useRouter()

  // Estado para diálogos
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [newStatus, setNewStatus] = useState<"PAID" | "PENDING" | "DEFEATED">("PAID")

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user")
      const token = localStorage.getItem("accessToken")
      const cookieToken = Cookies.get("client_token")

      if (!user || (!token && !cookieToken)) {
        console.log("Usuário não autenticado, redirecionando para login")
        router.push("/")
        return false
      }

      setClientToken(cookieToken || token || undefined)
      return true
    }

    const fetchData = async () => {
      if (!checkAuth()) return

      setIsLoading(true)
      setError(null)

      try {
        const token = Cookies.get("client_token") || localStorage.getItem("accessToken")

        if (!token) {
          throw new Error("Token de autenticação não encontrado")
        }

        // Buscar clientes, produtos e pagamentos em paralelo
        const [paymentsResult, clientsResult, productsResult] = await Promise.all([
          getPayments({}, token),
          getClients({}, token),
          getProducts({}, token),
        ])

        if (paymentsResult.error) {
          throw new Error(paymentsResult.error)
        }

        if (clientsResult.error) {
          throw new Error(clientsResult.error)
        }

        if (productsResult.error) {
          throw new Error(productsResult.error)
        }

        // Enriquecer os pagamentos com informações de clientes
        const enrichedPayments =
          paymentsResult.data?.map((payment) => {
            // Tentar encontrar a apólice correspondente (simulado)
            const policyName = `Apólice ${payment.policyId.substring(0, 8)}`

            // Encontrar um cliente aleatório para associar ao pagamento
            const randomClient =
              clientsResult.data && clientsResult.data.length > 0
                ? clientsResult.data[Math.floor(Math.random() * clientsResult.data.length)]
                : null

            return {
              ...payment,
              policy: {
                name: policyName,
                clientId: randomClient?.id || "",
                client: {
                  name: randomClient?.name || "Cliente",
                },
              },
            }
          }) || []

        setPayments(enrichedPayments)
        setClients(clientsResult.data || [])
        setProducts(productsResult.data || [])
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar dados")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleFilter = async (filters: PolicyFiltersType) => {
    setIsLoading(true)
    setError(null)

    try {
      // Adaptar os filtros de policy para os filtros de payment
      const paymentFilters: any = {}
      if (filters.clientId) paymentFilters.clientId = filters.clientId
      if (filters.productId) paymentFilters.productId = filters.productId
      if (filters.month) paymentFilters.month = filters.month
      if (filters.year) paymentFilters.year = filters.year
      if (filters.dueDate) paymentFilters.dueDate = filters.dueDate

      const result = await getPayments(paymentFilters, clientToken)

      if (result.error) {
        throw new Error(result.error)
      }

      setPayments(result.data || [])
    } catch (error) {
      console.error("Erro ao filtrar pagamentos:", error)
      setError(error instanceof Error ? error.message : "Erro ao filtrar pagamentos")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPayments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getPayments({}, clientToken)

      if (result.error) {
        throw new Error(result.error)
      }

      setPayments(result.data || [])
    } catch (error) {
      console.error("Erro ao atualizar lista de pagamentos:", error)
      setError(error instanceof Error ? error.message : "Erro ao atualizar lista de pagamentos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = (payment: Payment, status: "PAID" | "PENDING" | "DEFEATED") => {
    setSelectedPayment(payment)
    setNewStatus(status)
    setIsStatusDialogOpen(true)
  }

  return (
    <>
      <Sidebar />
      <div className="lg:ml-48 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Apólices e Pagamentos</h1>

            <div className="flex items-center gap-2">
              <NotificationSheet count={0} />
            </div>
          </div>

          <PolicyFilters clients={clients} products={products} onFilter={handleFilter} />

          <Tabs
            defaultValue="list"
            className="mb-6"
            onValueChange={(value) => setActiveView(value as "list" | "calendar")}
          >
            <TabsList className="bg-zinc-800 border border-zinc-700">
              <TabsTrigger value="list" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                <ListIcon className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
                {/* <CardHeader className="pb-0">
                  <CardTitle className="text-lg text-white">Lista de Pagamentos</CardTitle>
                </CardHeader> */}
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-950/50 border-red-900 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                    </div>
                  ) : payments.length > 0 ? (
                    <PaymentTable payments={payments} onUpdateStatus={handleUpdateStatus} />
                  ) : (
                    <div className="text-center py-8 text-zinc-400">Nenhum pagamento encontrado</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg text-white">Calendário de Vencimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-950/50 border-red-900 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
                    </div>
                  ) : (
                    <PolicyCalendar
                      policies={[]}
                      onSelectPolicy={() => {}}
                      payments={payments}
                      onSelectPayment={(payment) => handleUpdateStatus(payment, "PAID")}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Diálogo para atualizar status do pagamento */}
      {selectedPayment && (
        <PaymentStatusDialog
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          payment={selectedPayment}
          newStatus={newStatus}
          onSuccess={refreshPayments}
          clientToken={clientToken}
        />
      )}
    </>
  )
}
