"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Save, User, Mail, Lock, Shield, UserPlus, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserData {
  user: {
    props: {
      email: string
      password: string
      role: string
      createdAt: string
      updatedAt: string | null
    }
    _id: {
      value: string
    }
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // New user form states
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState("VIEWER")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken")
      const user = localStorage.getItem("user")

      if (!token || !user) {
        router.push("/")
        return null
      }

      return JSON.parse(user)
    }

    const fetchUserData = async () => {
      setIsLoading(true)
      setError("")

      const user = checkAuth()
      if (!user) return

      try {
        const apiUrl = "http://localhost:8080"
        if (!apiUrl) {
          throw new Error("API URL is not configured")
        }

        const response = await fetch(`${apiUrl}/users?id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Falha ao buscar dados do usuário")
        }

        const data: UserData = await response.json()
        setUserData(data)
        setEmail(data.user.props.email)
        setPassword(data.user.props.password)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    const user = JSON.parse(localStorage.getItem("user") || "{}")

    try {
      const apiUrl = "http://localhost:8080"
      if (!apiUrl) {
        throw new Error("API URL não está configurada")
      }

      const response = await fetch(`${apiUrl}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil")
      }

      setSuccess("Perfil atualizado com sucesso")

      // Update local storage with new email if it changed
      if (email !== user.email) {
        const updatedUser = { ...user, email }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateError("")
    setCreateSuccess("")

    try {
      const apiUrl = "http://localhost:8080"
      if (!apiUrl) {
        throw new Error("API URL não está configurada")
      }

      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao criar usuário")
      }

      setCreateSuccess("Usuário criado com sucesso")
      // Reset form
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRole("VIEWER")
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Ocorreu um erro")
    } finally {
      setIsCreating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-4" />
          <p className="text-zinc-400">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  const isAdmin = userData?.user.props.role === "ADMIN"

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-red-900/20 to-rose-900/20 blur-3xl"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-red-900/20 to-rose-900/20 blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Configurações de perfil</h1>
          </div>
        </div>

        {isAdmin ? (
          <Tabs defaultValue="profile" className="mb-6">
            <TabsList className="bg-zinc-800 border border-zinc-700">
              <TabsTrigger value="profile" className="data-[state=active]:bg-red-900 data-[state=active]:text-white">
                Perfil
              </TabsTrigger>
              <TabsTrigger
                value="create-user"
                className="data-[state=active]:bg-red-900 data-[state=active]:text-white"
              >
                Criar Usuário
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab
                userData={userData}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleSubmit={handleSubmit}
                isSaving={isSaving}
                error={error}
                success={success}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="create-user">
              <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-red-500" />
                    Criar Novo Usuário
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Adicione um novo usuário ao sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-5">
                    {createError && (
                      <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{createError}</AlertDescription>
                      </Alert>
                    )}

                    {createSuccess && (
                      <Alert className="bg-green-950/50 border-green-900 text-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertDescription>{createSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newUserEmail" className="text-zinc-300 text-sm">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                        <Input
                          id="newUserEmail"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                          className="bg-zinc-800/50 border-zinc-700 text-white pl-10 h-11 focus-visible:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newUserPassword" className="text-zinc-300 text-sm">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                        <Input
                          id="newUserPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          required
                          className="bg-zinc-800/50 border-zinc-700 text-white pl-10 pr-10 h-11 focus-visible:ring-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
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
                      <Label htmlFor="newUserRole" className="text-zinc-300 text-sm">
                        Role
                      </Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
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
            </TabsContent>
          </Tabs>
        ) : (
          <ProfileTab
            userData={userData}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleSubmit={handleSubmit}
            isSaving={isSaving}
            error={error}
            success={success}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  )
}

// Extracted Profile Tab Component
function ProfileTab({
  userData,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleSubmit,
  isSaving,
  error,
  success,
  formatDate,
}: {
  userData: UserData | null
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isSaving: boolean
  error: string
  success: string
  formatDate: (date: string | null) => string
}) {
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
            <Label htmlFor="email" className="text-zinc-300 text-sm">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={userData?.user.props.role || ""}
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
              <p className="text-zinc-300">{formatDate(userData?.user.props.createdAt || null)}</p>
            </div>

            <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
              <p className="text-sm text-zinc-500">Ultima atualização</p>
              <p className="text-zinc-300">{formatDate(userData?.user.props.updatedAt || null)}</p>
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

