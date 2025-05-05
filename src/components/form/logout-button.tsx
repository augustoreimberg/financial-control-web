"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { logout } from "@/actions/auth"
import Cookies from "js-cookie"

export default function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")

      Cookies.remove("client_token")

      const result = await logout()

      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
    })
  }

  return (
    <Button
      onClick={handleLogout}
      className="w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white h-11 mt-2 shadow-lg shadow-red-900/20"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Saindo...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </>
      )}
    </Button>
  )
}
