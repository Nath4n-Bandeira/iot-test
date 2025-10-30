// context/FriendsContext.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Friend {
  id: string // Changed from number to string to match Usuario schema
  nome: string
  email: string
  avatar?: string
}

export interface Message {
  id: number
  senderId: string // Changed from number to string to match Usuario id type
  receiverId: string // Changed from number to string to match Usuario id type
  content: string
  timestamp: Date
  read: boolean
}

type FriendsStore = {
  friends: Friend[]
  messages: Message[]
  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void // Changed parameter type to string
  sendMessage: (message: Omit<Message, "id" | "timestamp" | "read">) => void
  markAsRead: (messageId: number) => void
  getConversation: (userId: string, friendId: string) => Message[] // Changed parameter types to string
}

export const useFriendsStore = create<FriendsStore>()(
  persist(
    (set, get) => ({
      friends: [],
      messages: [],
      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),
      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),
      sendMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Date.now(),
              timestamp: new Date(),
              read: false,
            },
          ],
        })),
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
    }),
    {
      name: "friends-storage",
    },
  ),
)
