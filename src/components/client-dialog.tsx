"use client"

import type React from "react"
import { useState } from "react"
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
import type { Client } from "@/actions/get-clients"
import { createClient } from "@/actions/create-client"
import { updateClient } from "@/actions/update-client"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSuccess: () => void
  clientToken?: string
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
  clientToken,
}: ClientDialogProps) {
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    sinacorCode: client?.sinacorCode || "",
    accountNumber: client?.accountNumber || "",
  })

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!client

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("email", form.email)
      formData.append("sinacorCode", form.sinacorCode)
      formData.append("accountNumber", form.accountNumber)

      let result

      if (isEditing && client?.id) {
        formData.append("id", client.id)
        result = await updateClient(formData, clientToken)
      } else {
        result = await createClient(formData, clientToken)
      }

      if (result.error) {
        setError(result.error)
      } else {
        setForm({ name: "", email: "", sinacorCode: "", accountNumber: "" })
        onOpenChange(false)
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar a solicitação")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setForm({ name: "", email: "", sinacorCode: "", accountNumber: "" })
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isEditing
                ? "Atualize os dados do cliente abaixo."
                : "Preencha os dados para cadastrar um novo cliente."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {[
              { id: "name", label: "Nome" },
              { id: "email", label: "Email" },
              { id: "sinacorCode", label: "Código Sinacor" },
              { id: "accountNumber", label: "Número da Conta" },
            ].map(({ id, label }) => (
              <div key={id} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={id} className="text-right text-zinc-400">{label}</Label>
                <Input
                  id={id}
                  name={id}
                  value={(form as any)[id]}
                  onChange={handleChange}
                  required
                  className="col-span-3 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                "Criar cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
