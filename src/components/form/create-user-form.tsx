"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, UserPlus, Mail, Lock, User, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser } from "@/actions/user"

interface CreateUserFormProps {
  clientToken: string | undefined
}

export default function CreateUserForm({ clientToken }: CreateUserFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormState((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError("")
    setSuccess("")

    try {
      console.log("Criando novo usuário")

      const result = await createUser(formState, clientToken)

      if (!result.success) {
        throw new Error(result.error || "Falha ao criar usuário")
      }

      setSuccess("Usuário criado com sucesso")
      setFormState({
        name: "",
        email: "",
        password: "",
        role: "VIEWER",
      })
    } catch (err) {
      console.error("Erro ao criar usuário:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center">
          <UserPlus className="h-5 w-5 mr-2 text-red-500" />
          Criar Novo Usuário
        </CardTitle>
        <CardDescription className="text-zinc-400">Adicione um novo usuário ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-950/50 border-green-900 text-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300 text-sm">
              Nome
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <Input
                id="name"
                name="name"
                type="text"
                value={formState.name}
                onChange={handleChange}
                placeholder="Digite o nome completo..."
                required
                className="bg-zinc-800/50 border-zinc-700 text-white pl-10 h-11 focus-visible:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300 text-sm">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Digite o email Quark..."
                required
                className="bg-zinc-800/50 border-zinc-700 text-white pl-10 h-11 focus-visible:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300 text-sm">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={handleChange}
                placeholder="Digite a senha..."
                required
                className="bg-zinc-800/50 border-zinc-700 text-white pl-10 pr-10 h-11 focus-visible:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-zinc-300 text-sm">
              Role
            </Label>
            <Select value={formState.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white h-11 focus:ring-red-500">
                <SelectValue placeholder="Selecione um role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="VIEWER">VIEWER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="ADVISOR">ADVISOR</SelectItem>
                <SelectItem value="BROKER">BROKER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white h-11 mt-4 shadow-lg shadow-red-900/20"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Criar Usuário
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
