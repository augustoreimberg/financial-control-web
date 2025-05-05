"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createProduct } from "@/actions/create-product"
import { updateProduct } from "@/actions/update-product"
import type { Product } from "@/actions/get-product"
interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess: () => void
  clientToken?: string
}

export function ProductDialog({ open, onOpenChange, product, onSuccess, clientToken }: ProductDialogProps) {
  const [name, setName] = useState("")

  // Atualizar o nome quando o produto mudar ou quando o diálogo abrir
  useEffect(() => {
    if (open) {
      setName(product?.name || "")
    } else {

      setName("")
      setError(null)
    }
  }, [open, product])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!product

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", name)

      let result

      if (isEditing && product?.id) {
        formData.append("id", product.id)
        console.log("Atualizando produto:", {
          id: product.id,
          name: name,
        })
        result = await updateProduct(formData, clientToken)
      } else {
        result = await createProduct(formData, clientToken)
      }

      if (result.error) {
        setError(result.error)
      } else {
        onOpenChange(false)
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao processar a solicitação")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isEditing
                ? "Atualize as informações do produto abaixo."
                : "Preencha as informações para criar um novo produto."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-zinc-400">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                placeholder="Digite o nome do produto"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Salvando..." : "Criando..."}
                </>
              ) : isEditing ? (
                "Salvar alterações"
              ) : (
                "Criar produto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
