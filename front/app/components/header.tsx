"use client"
import Link from "next/link"
import Image from "next/image"
import { useClienteStore } from "../context/ClienteContext" // Usando sua lógica original
import { useFriendsStore } from "../context/FriendsContext"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import Cookie from "js-cookie"
import FriendsModal from "./modals/FriendsModal"

export function Header() {
  const { cliente, deslogaCliente } = useClienteStore()
  const { reset: resetFriends } = useFriendsStore()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  function clienteSair() {
    if (confirm("Confirma saída da conta ?")) {
      deslogaCliente()
      resetFriends()
      if (localStorage.getItem("clienteKey")) {
        localStorage.removeItem("clienteKey")
      }
      router.push("/login")
      Cookie.remove("token")
    }
  }

  const isLoggedIn = cliente && cliente.id

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href={isLoggedIn ? "/" : "/"} className="flex items-center gap-3">
              <Image src="/horde.png" alt="FoodFlow Logo" width={48} height={48} className="h-12 w-auto" priority />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-black">foodflow</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              // --- logaduuuuu ---
              <>
                <FriendsModal />

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="hidden sm:inline font-semibold text-gray-700">{cliente.nome}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="p-2">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{cliente.nome}</p>
                        </div>
                        <div className="h-px bg-gray-200 my-1"></div>
                        <Link
                          href="/perfil"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                        >
                          <Settings className="w-4 h-4 text-gray-500" /> Meu Perfil
                        </Link>
                        <Link
                          href="/"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                        >
                          Minhas Dispensas
                        </Link>
                        <button
                          onClick={clienteSair}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 hover:text-red-700"
                        >
                          <LogOut className="w-4 h-4" /> Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // --- não ta logaduuuu ---
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
