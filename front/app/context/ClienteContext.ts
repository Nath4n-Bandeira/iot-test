// context/ClienteContext.ts
import { ClienteItf } from '../utils/types/ClienteItf'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ClienteStore = {
    cliente: ClienteItf
    logaCliente: (clienteLogado: ClienteItf) => void
    deslogaCliente: () => void
}

export const useClienteStore = create<ClienteStore>()(
    persist(
        (set) => ({
            cliente: {} as ClienteItf,
            logaCliente: (clienteLogado) => set({ cliente: clienteLogado }),
            deslogaCliente: () => set({ cliente: {} as ClienteItf })
        }),
        {
            name: 'cliente-storage', 
        }
    )
)
