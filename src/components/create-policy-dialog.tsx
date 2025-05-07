// Novo componente modal para criar apólice
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, CalendarIcon, ShieldPlus } from "lucide-react"
import { createPolicy } from "@/actions/create-policy"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface CreatePolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientToken?: string
  onCreated: () => void
  clients: { id: string; name: string }[]
  products: { id: string; name: string }[]
}

export function CreatePolicyDialog({ open, onOpenChange, clientToken, onCreated, clients, products }: CreatePolicyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    productId: "",
    policyNumber: "",
    validity: "",
    frequency: "MONTHLY",
    monthlyPremium: "",
    annualPremium: "",
    paymentMethod: "CREDIT",
    dueDate: ""
  })

  const [validityDate, setValidityDate] = useState<Date | undefined>()
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    const fd = new FormData()
    Object.entries({
      ...formData,
      validity: validityDate ? validityDate.toISOString() : "",
      dueDate: dueDate ? dueDate.toISOString() : ""
    }).forEach(([key, val]) => fd.append(key, val))

    const result = await createPolicy(fd, clientToken)
    if (result.error) {
      setError(result.error)
    } else {
      onOpenChange(false)
      onCreated()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white shadow-2xl rounded-2xl p-6">
        <DialogHeader className="flex flex-row items-center gap-2 mb-4">
          <ShieldPlus/>
          <DialogTitle className="text-2xl font-bold">Nova Apólice</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Nome da apólice" onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="clientId">Cliente</Label>
            <select id="clientId" name="clientId" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2">
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="productId">Produto</Label>
            <select id="productId" name="productId" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2">
              <option value="">Selecione um produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="policyNumber">Número da Apólice</Label>
            <Input id="policyNumber" name="policyNumber" placeholder="000000" onChange={handleChange} />
          </div>

          <div className="space-y-1">
            <Label>Validade</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-zinc-900 border-zinc-700">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {validityDate ? format(validityDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700 text-white">
                <Calendar
                  mode="single"
                  selected={validityDate}
                  onSelect={setValidityDate}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label>Vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-zinc-900 border-zinc-700">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700 text-white">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label htmlFor="frequency">Frequência</Label>
            <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2">
              <option value="MONTHLY">Mensal</option>
              <option value="ANNUAL">Anual</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <select id="paymentMethod" name="paymentMethod" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2">
              <option value="CREDIT">Cartão de Crédito</option>
              <option value="DEBIT">Débito em Conta</option>
              <option value="BILL">Boleto</option>
            </select>
          </div>

          {formData.frequency === "MONTHLY" && (
            <div className="space-y-1">
              <Label htmlFor="monthlyPremium">Prêmio Mensal</Label>
              <Input id="monthlyPremium" name="monthlyPremium" type="number" placeholder="R$ 0,00" onChange={handleChange} />
            </div>
          )}

          {formData.frequency === "ANNUAL" && (
            <div className="space-y-1">
              <Label htmlFor="annualPremium">Prêmio Anual</Label>
              <Input id="annualPremium" name="annualPremium" type="number" placeholder="R$ 0,00" onChange={handleChange} />
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}


        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Criando...</>
            ) : (
              "Criar Apólice"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
