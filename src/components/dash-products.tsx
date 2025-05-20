"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Package, Plus, Search, Pencil, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProductDialog } from "@/components/product-dialog"
import { getProducts, type Product } from "@/actions/get-product"

interface DashboardProductsProps {
  initialProducts: Product[]
  clientToken: string
}

export default function DashboardProducts({ initialProducts, clientToken }: DashboardProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center pt-2">
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
                    <TableHead className="text-zinc-400">Atualizado em</TableHead>
                    <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">{product.name}</TableCell>
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
