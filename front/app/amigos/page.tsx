"use client"
import { UserSearchBox } from "../components/UserSearchBox"
import { useFriendsStore } from "../context/FriendsContext"
import { useClienteStore } from "../context/ClienteContext"
import { MessageCircle, UserMinus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from "react"
import PendingFriendRequests from "../components/PendingFriendRequest"
export default function AmigosPage() {
  const { friends, removeFriend, messages, openChat, loadFriends } = useFriendsStore()
  const { cliente, isHydrated } = useClienteStore()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && (!cliente || !cliente.id)) {
      router.push("/login")
    }
  }, [cliente, router, isHydrated])

  useEffect(() => {
    if (isHydrated && cliente?.id) {
      loadFriends()
    }
  }, [isHydrated, cliente?.id, loadFriends])

  if (!isHydrated || !cliente || !cliente.id) {
    return null
  }

  const handleRemoveFriend = (friendId: string) => {
    if (confirm("Tem certeza que deseja remover este amigo?")) {
      removeFriend(friendId)
    }
  }

  const getUnreadCount = (friendId: string) => {
    return messages.filter((msg) => msg.senderId === friendId && msg.receiverId === cliente.id && !msg.read).length
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            Meus Amigos
          </h1>
          <p className="text-gray-600">Conecte-se e converse com seus amigos</p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <UserSearchBox />
        </div>

        {/* Pending Friend Requests */}
        <PendingFriendRequests />

        {/* Friends List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Amigos ({friends.length})</h2>
          </div>

          {friends.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Você ainda não tem amigos</p>
              <p className="text-gray-400">Use a busca acima para encontrar e adicionar amigos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {friends.map((friend) => {
                const unreadCount = getUnreadCount(friend.id)
                return (
                  <div
                    key={friend.id}
                    className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-lg">
                        {friend.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{friend.nome}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openChat(friend)}
                        className="relative p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        title="Enviar mensagem"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Remover amigo"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
