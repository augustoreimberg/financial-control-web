"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Save, User, Mail, Lock, Shield, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type UserData, updateUserProfile } from "@/actions/user"

interface ProfileFormProps {
  userData: UserData | null
  userId: string
  clientToken: string | undefined
  onProfileUpdated: (name: string, email: string) => void
}

export default function ProfileForm({ userData, userId, clientToken, onProfileUpdated }: ProfileFormProps) {
  const [formState, setFormState] = useState({
    name: userData?.user.name || "",
    email: userData?.user.email || "",
    password: userData?.user.password || "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      console.log("Atualizando perfil para usuário:", userId)

      const result = await updateUserProfile(userId, formState, clientToken)

      if (!result.success) {
        throw new Error(result.error || "Falha ao atualizar perfil")
      }

      setSuccess("Perfil atualizado com sucesso")
      onProfileUpdated(formState.name, formState.email)
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center">
          <User className="h-5 w-5 mr-2 text-red-500" />
          Perfil de usuário
        </CardTitle>
        <CardDescription className="text-zinc-400">Visualize e edite suas informações de perfil</CardDescription>
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
                    xmlns="http://www.w3.org/2000/svg"
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
                    xmlns="http://www.w3.org/2000/svg"
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
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <Input
                id="role"
                value={userData?.user.role || ""}
                readOnly
                disabled
                className="bg-zinc-800/30 border-zinc-700 text-zinc-400 pl-10 h-11 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-zinc-500">Role não pode ser alterado</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-500">Criado em</p>
              <p className="text-zinc-300">{formatDate(userData?.user.createdAt || null)}</p>
            </div>

            <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-500">Ultima atualização</p>
              <p className="text-zinc-300">{formatDate(userData?.user.updatedAt || null)}</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white h-11 mt-4 shadow-lg shadow-red-900/20"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Salvar alterações
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
