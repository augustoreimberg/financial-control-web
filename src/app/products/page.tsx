"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Package, Plus, Search, Pencil, Trash2, AlertCircle } from "lucide-react"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { getProducts, type Product } from "@/actions/get-product"
import { ProductDialog } from "@/components/product-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [clientToken, setClientToken] = useState<string | undefined>(undefined)
  const router = useRouter()

  // Estado para diálogos
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

    const fetchProducts = async () => {
      if (!checkAuth()) return

      setIsLoading(true)
      setError(null)

      try {
        const token = Cookies.get("client_token") || localStorage.getItem("accessToken")

        if (!token) {
          throw new Error("Token de autenticação não encontrado")
        }

        console.log("Buscando produtos com token:", token.substring(0, 15) + "...")
        const result = await getProducts({}, token)

        console.log("Resultado da busca de produtos:", result)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.data) {
          console.log("Produtos recebidos na página:", result.data.length)
          console.log("Primeiro produto:", result.data[0])
          setProducts(result.data)
        } else {
          console.log("Nenhum produto recebido")
          setProducts([])
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar produtos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [router])

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getProducts({ name: searchTerm }, clientToken)

      if (result.error) {
        throw new Error(result.error)
      }

      setProducts(result.data || [])
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      setError(error instanceof Error ? error.message : "Erro ao buscar produtos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const refreshProducts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getProducts({}, clientToken)

      if (result.error) {
        throw new Error(result.error)
      }

      setProducts(result.data || [])
    } catch (error) {
      console.error("Erro ao atualizar lista de produtos:", error)
      setError(error instanceof Error ? error.message : "Erro ao atualizar lista de produtos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsProductDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsProductDialogOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <Sidebar />
      <div className="lg:ml-48 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Package className="mr-2 h-6 w-6 text-red-500" />
              Produtos
            </h1>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                />
              </div>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </div>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg text-white">Lista de Produtos</CardTitle>
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
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="text-zinc-400">Nome</TableHead>
                        <TableHead className="text-zinc-400">Criado em</TableHead>
                        <TableHead className="text-zinc-400">Atualizado em</TableHead>
                        <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell className="text-white font-medium">{product.name}</TableCell>
                          <TableCell className="text-zinc-300">{formatDate(product.createdAt)}</TableCell>
                          <TableCell className="text-zinc-300">{formatDate(product.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  {searchTerm ? "Nenhum produto encontrado com esse termo" : "Nenhum produto disponível"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo para criar/editar produto */}
      <ProductDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        onSuccess={refreshProducts}
        clientToken={clientToken}
      />
    
    </>
  )
}
