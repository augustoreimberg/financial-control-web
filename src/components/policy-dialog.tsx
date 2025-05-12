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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AlertCircle, Loader2, CalendarIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createPolicy } from "@/actions/create-policy"
import { updatePolicy } from "@/actions/update-payment-status"
import type { Policy } from "@/actions/create-policy"
import type { Client } from "@/actions/get-clients"
import type { Product } from "@/actions/get-product"

interface PolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy?: Policy | null
  clients: Client[]
  products: Product[]
  onSuccess: () => void
  clientToken?: string
}

export function PolicyDialog({
  open,
  onOpenChange,
  policy,
  clients,
  products,
  onSuccess,
  clientToken,
}: PolicyDialogProps) {
  const [formState, setFormState] = useState({
    name: "",
    clientId: "",
    productId: "",
    policyNumber: "",
    validity: "",
    frequency: "MONTHLY" as "MONTHLY" | "ANNUAL",
    monthlyPremium: "",
    annualPremium: "",
    paymentMethod: "CREDIT" as "CREDIT" | "DEBIT" | "BILL",
    dueDate: "",
  })

  const [validityDate, setValidityDate] = useState<Date | undefined>(undefined)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && policy) {
      setFormState({
        name: policy.name || "",
        clientId: policy.clientId || "",
        productId: policy.productId || "",
        policyNumber: policy.policyNumber || "",
        validity: policy.validity || "",
        frequency: policy.frequency || "MONTHLY",
        monthlyPremium: policy.monthlyPremium?.toString() || "",
        annualPremium: policy.annualPremium?.toString() || "",
        paymentMethod: policy.paymentMethod || "CREDIT",
        dueDate: policy.dueDate || "",
      })

      try {
        if (policy.validity) {
          setValidityDate(new Date(policy.validity))
        }
        if (policy.dueDate) {
          setDueDate(new Date(policy.dueDate))
        }
      } catch (error) {
        console.error("Erro ao converter datas:", error)
      }
    } else if (!open) {
      setFormState({
        name: "",
        clientId: "",
        productId: "",
        policyNumber: "",
        validity: "",
        frequency: "MONTHLY",
        monthlyPremium: "",
        annualPremium: "",
        paymentMethod: "CREDIT",
        dueDate: "",
      })
      setValidityDate(undefined)
      setDueDate(undefined)
      setError(null)
    }
  }, [open, policy])

  const isEditing = !!policy

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()

      Object.entries(formState).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      if (isEditing && policy?.id) {
        formData.append("id", policy.id)
      }

      let result

      if (isEditing && policy?.id) {
        result = await updatePolicy(formData, clientToken)
      } else {
        result = await createPolicy(formData, clientToken)
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
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Apólice" : "Nova Apólice"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isEditing
                ? "Atualize as informações da apólice abaixo."
                : "Preencha as informações para criar uma nova apólice."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-400">
                  Nome da Apólice
                </Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                  placeholder="Digite o nome da apólice"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber" className="text-zinc-400">
                  Número da Apólice
                </Label>
                <Input
                  id="policyNumber"
                  value={formState.policyNumber}
                  onChange={(e) => handleChange("policyNumber", e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                  placeholder="Digite o número da apólice"
                  disabled={isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-zinc-400">
                  Cliente
                </Label>
                <Select
                  value={formState.clientId}
                  onValueChange={(value) => handleChange("clientId", value)}
                  disabled={isEditing}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product" className="text-zinc-400">
                  Produto
                </Label>
                <Select
                  value={formState.productId}
                  onValueChange={(value) => handleChange("productId", value)}
                  disabled={isEditing}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validity" className="text-zinc-400">
                  Vigência
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="validity"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white",
                        !validityDate && "text-zinc-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validityDate ? format(validityDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                    <Calendar
                      mode="single"
                      selected={validityDate}
                      onSelect={(date) => {
                        setValidityDate(date)
                        if (date) {
                          handleChange("validity", date.toISOString())
                        }
                      }}
                      initialFocus
                      className="bg-zinc-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-zinc-400">
                  Frequência
                </Label>
                <Select
                  value={formState.frequency}
                  onValueChange={(value: "MONTHLY" | "ANNUAL") => handleChange("frequency", value)}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="ANNUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPremium" className="text-zinc-400">
                  Prêmio Mensal (R$)
                </Label>
                <Input
                  id="monthlyPremium"
                  type="number"
                  step="0.01"
                  value={formState.monthlyPremium}
                  onChange={(e) => handleChange("monthlyPremium", e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualPremium" className="text-zinc-400">
                  Prêmio Anual (R$)
                </Label>
                <Input
                  id="annualPremium"
                  type="number"
                  step="0.01"
                  value={formState.annualPremium}
                  onChange={(e) => handleChange("annualPremium", e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-zinc-400">
                  Forma de Pagamento
                </Label>
                <Select
                  value={formState.paymentMethod}
                  onValueChange={(value: "CREDIT" | "DEBIT" | "BILL") => handleChange("paymentMethod", value)}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white focus:ring-red-500">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="CREDIT">Cartão de Crédito</SelectItem>
                    <SelectItem value="DEBIT">Débito em Conta</SelectItem>
                    <SelectItem value="BILL">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-zinc-400">
                  Data de Vencimento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dueDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white",
                        !dueDate && "text-zinc-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date)
                        if (date) {
                          handleChange("dueDate", date.toISOString())
                        }
                      }}
                      initialFocus
                      className="bg-zinc-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                "Criar apólice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
