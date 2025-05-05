"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth } from "@/actions/auth"
import Cookies from "js-cookie"
import Image from "next/image"

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const token = Cookies.get("client_token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  async function handleSubmit(formData: FormData) {
    setError("")

    startTransition(async () => {
      try {
        const result = await auth(formData)

        if (!result.success) {
          setError(result.error || "Falha ao fazer login")
          return
        }
        if (result.data) {
          localStorage.setItem("user", JSON.stringify(result.data.user))

          localStorage.setItem("accessToken", result.data.accessToken)

          Cookies.set("client_token", result.data.accessToken, {
            expires: 7, 
            path: "/",
            sameSite: "lax",
          })

          console.log("Login bem-sucedido, token armazenado:", result.data.accessToken.substring(0, 15) + "...")
          console.log("Redirecionando para", result.redirectTo)

          if (result.redirectTo) {
            router.push(result.redirectTo)
            router.refresh()
          }
        }
      } catch (err) {
        console.error("Erro durante o login:", err)
        setError(err instanceof Error ? err.message : "Falha ao fazer login")
      }
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <img src="/logo.svg" alt="QWALLET Logo" className="h-20" />
        </div>
        <CardTitle className="text-xl text-white">Entrar</CardTitle>
        <CardDescription className="text-zinc-400">Preencha seu email e senha</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                placeholder="exemplo@quarkinvestimentos.com"
                required
                className="bg-zinc-800/50 border-zinc-700 text-white pl-10 h-11 focus-visible:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300 text-sm">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                required
                className="bg-zinc-800/50 border-zinc-700 text-white pl-10 pr-10 h-11 focus-visible:ring-red-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white h-11 mt-2 shadow-lg shadow-red-900/20"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
