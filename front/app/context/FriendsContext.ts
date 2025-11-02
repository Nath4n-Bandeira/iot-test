// context/FriendsContext.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"

export interface Friend {
  id: string
  nome: string
  email: string
  avatar?: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

type FriendsStore = {
  friends: Friend[]
  messages: Message[]
  activeChat: Friend | null
  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void
  sendMessage: (message: Omit<Message, "id" | "timestamp" | "read">) => Promise<void>
  markAsRead: (messageId: string) => void
  getConversation: (userId: string, friendId: string) => Message[]
  loadConversation: (userId: string, friendId: string) => Promise<void>
  setMessages: (messages: Message[]) => void
  openChat: (friend: Friend) => void
  closeChat: () => void
  reset: () => void
}

const getAuthHeaders = () => {
  const token = Cookies.get("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const useFriendsStore = create<FriendsStore>()(
  persist(
    (set, get) => ({
      friends: [],
      messages: [],
      activeChat: null,
      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),
      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),
      sendMessage: async (message) => {
        try {
          console.log("[v0] Sending message to backend:", message)
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/mensagens`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              destinatarioId: message.receiverId,
              conteudo: message.content,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error("[v0] Failed to send message:", errorText)
            throw new Error("Failed to send message")
          }

          const savedMessage = await response.json()
          console.log("[v0] Message saved:", savedMessage)

          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: savedMessage.id,
                senderId: savedMessage.remetenteId,
                receiverId: savedMessage.destinatarioId,
                content: savedMessage.conteudo,
                timestamp: new Date(savedMessage.createdAt),
                read: savedMessage.lida,
              },
            ],
          }))
        } catch (error) {
          console.error("[v0] Error sending message:", error)
          // Fallback to local storage if API fails
          set((state) => ({
            messages: [
              ...state.messages,
              {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date(),
                read: false,
              },
            ],
          }))
        }
      },
      markAsRead: (messageId) =>
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)),
        })),
      getConversation: (userId, friendId) => {
        const { messages } = get()
        return messages
          .filter(
            (msg) =>
              (msg.senderId === userId && msg.receiverId === friendId) ||
              (msg.senderId === friendId && msg.receiverId === userId),
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      },
      loadConversation: async (userId, friendId) => {
        try {
          console.log("[v0] Loading conversation between:", userId, "and", friendId)
          console.log("[v0] API URL:", `${process.env.NEXT_PUBLIC_URL_API}/mensagens/conversa/${friendId}`)
          console.log("[v0] Token:", Cookies.get("token") ? "Present" : "Missing")

          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/mensagens/conversa/${friendId}`, {
            headers: getAuthHeaders(),
          })

          console.log("[v0] Response status:", response.status, response.statusText)

          if (!response.ok) {
            const errorText = await response.text()
            console.error("[v0] Failed to load messages. Status:", response.status)
            console.error("[v0] Error response:", errorText)
            throw new Error(`Failed to load messages: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          console.log("[v0] Loaded messages from API:", data)

          const messages: Message[] = Array.isArray(data)
            ? data.map((msg: any) => ({
                id: msg.id,
                senderId: msg.remetenteId,
                receiverId: msg.destinatarioId,
                content: msg.conteudo,
                timestamp: new Date(msg.createdAt),
                read: msg.lida,
              }))
            : []

          set((state) => {
            const otherMessages = state.messages.filter(
              (m) =>
                !(
                  (m.senderId === userId && m.receiverId === friendId) ||
                  (m.senderId === friendId && m.receiverId === userId)
                ),
            )
            return {
              messages: [...otherMessages, ...messages],
            }
          })
        } catch (error) {
          console.error("[v0] Error loading conversation:", error)
        }
      },
      setMessages: (messages) => set({ messages }),
      openChat: (friend) => set({ activeChat: friend }),
      closeChat: () => set({ activeChat: null }),
      reset: () => set({ friends: [], messages: [], activeChat: null }),
    }),
    {
      name: "friends-storage",
      partialize: (state) => ({
        friends: state.friends,
        messages: state.messages,
      }),
    },
  ),
)
