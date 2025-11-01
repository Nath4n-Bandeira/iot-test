"use client"
import { useState, useEffect } from "react"
import { Search, UserPlus, X, Loader2 } from "lucide-react"
import { useFriendsStore, type Friend } from "../context/FriendsContext"
import { useClienteStore } from "../context/ClienteContext"

export function UserSearchBox() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [allUsers, setAllUsers] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { friends, addFriend } = useFriendsStore()
  const { cliente } = useClienteStore()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("[v0] Fetching users from API:", `${process.env.NEXT_PUBLIC_URL_API}/clientes`)
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`)

        if (!response.ok) {
          throw new Error("Erro ao carregar usuários")
        }

        const data = await response.json()
        console.log("[v0] API response:", data)

        let users: Friend[] = []
        if (Array.isArray(data)) {
          users = data
        } else if (data.clientes && Array.isArray(data.clientes)) {
          users = data.clientes
        } else if (data.data && Array.isArray(data.data)) {
          users = data.data
        } else {
          console.error("[v0] Unexpected API response structure:", data)
          throw new Error("Formato de resposta inválido")
        }

        console.log("[v0] Processed users:", users)
        setAllUsers(users)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar usuários")
        console.error("[v0] Erro ao buscar usuários:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = Array.isArray(allUsers)
    ? allUsers.filter(
        (user) =>
          user.id !== cliente.id &&
          !friends.some((f) => f.id === user.id) &&
          (user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : []

  const handleAddFriend = (user: Friend) => {
    addFriend(user)
    setSearchQuery("")
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Procurar usuários..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={loading}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {searchQuery && !loading && (
          <button
            onClick={() => {
              setSearchQuery("")
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="absolute z-50 w-full mt-2 bg-red-50 rounded-lg shadow-lg border border-red-200 p-4 text-center text-red-600">
          {error}
        </div>
      )}

      {isOpen && searchQuery && !loading && !error && filteredUsers.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.nome}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleAddFriend(user)}
                className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                title="Adicionar amigo"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isOpen && searchQuery && !loading && !error && filteredUsers.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  )
}
