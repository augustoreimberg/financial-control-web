"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Plus, Search, Pencil, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClients, type Client } from "@/actions/get-clients"
import { ClientDialog } from "./client-dialog"// componente de diálogo a ser criado

interface DashboardClientsProps {
  initialClients: Client[]
  clientToken: string
}

export default function DashboardClients({ initialClients, clientToken }: DashboardClientsProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getClients({ name: searchTerm }, clientToken)
      if (result.error) throw new Error(result.error)
      setClients(result.data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao buscar clientes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  const refreshClients = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getClients({}, clientToken)
      if (result.error) throw new Error(result.error)
      setClients(result.data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao atualizar lista de clientes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClient = () => {
    setSelectedClient(null)
    setIsClientDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsClientDialogOpen(true)
  }

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center pt-2">
          <Users className="mr-2 h-6 w-6 text-red-500" />
          Clientes
        </h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-red-500"
            />
          </div>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
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
          ) : filteredClients.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableHead className="text-zinc-400">Nome</TableHead>
                    <TableHead className="text-zinc-400">Código Sinacor</TableHead>
                    <TableHead className="text-zinc-400">Conta</TableHead>
                    <TableHead className="text-zinc-400">Atualizado em</TableHead>
                    <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">{client.name}</TableCell>
                      <TableCell className="text-zinc-300">{client.sinacorCode}</TableCell>
                      <TableCell className="text-zinc-300">{client.accountNumber}</TableCell>
                      <TableCell className="text-zinc-300">{formatDate(client.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            onClick={() => handleEditClient(client)}
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
              {searchTerm ? "Nenhum cliente encontrado com esse termo" : "Nenhum cliente disponível"}
            </div>
          )}
        </CardContent>
      </Card>

      <ClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        client={selectedClient}
        onSuccess={refreshClients}
        clientToken={clientToken}
      />
    </>
  )
}
