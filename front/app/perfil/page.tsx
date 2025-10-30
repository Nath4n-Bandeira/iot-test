"use client"
import React, { useState, useEffect } from 'react'
import { useClienteStore } from "../context/ClienteContext"
import ClientModal from "../components/modals/clientModal"
import { DispensaItf } from '../utils/types/DispensaItf'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'     
export default function Perfil() {
  const { cliente } = useClienteStore()
  const [dispensasCriadas, setDispensasCriadas] = useState<DispensaItf[]>([])
  const [dispensasMembro, setDispensasMembro] = useState<DispensaItf[]>([])
  const id = cliente.id
  const router = useRouter()
  const getInitial = (name: string | undefined): string => {
    return name?.charAt(0).toUpperCase() || 'U'
  }

const [logado, setLogado] = useState<boolean>(false)

  useEffect(() => {
    if (Cookies.get("token")) {
      setLogado(true)
    } else {
      router.replace("/")
    }
  }, [])

   useEffect(() => {
    const carregarDispensas = async () => {
      try {
     
        const criadasRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa/cliente/${id}`);
        const criadas = await criadasRes.json();

    
        const membroRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa/membro/${id}`);
        const membro = await membroRes.json();

        // Remove duplicatas (Só pra fazer questão que certas dispensas não spawnem na seção errada)
        const membroFiltrado = membro.filter(
          (d: DispensaItf) => !criadas.find((c: DispensaItf) => c.id === d.id)
        );

        setDispensasCriadas(criadas);
        setDispensasMembro(membroFiltrado);
      } catch (error) {
        console.error("Erro ao carregar dispensas:", error);
      }
    };

    if (id) carregarDispensas();
  }, [id]);

  const renderDispensas = (lista: DispensaItf[]) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {lista.map((dispensa) => (
        <div key={dispensa.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{dispensa.nome}</h3>
            <p className="text-slate-500 text-sm">
              {dispensa.createdAt 
                ? new Date(dispensa.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) 
                : 'Sem data'}
            </p>
          </div>
          <a href={`/dispensa/${dispensa.id}`} className="mt-6 inline-block text-green-600 font-semibold hover:underline self-start">
            Ver detalhes →
          </a>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="w-40 h-40 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-6xl font-bold text-white select-none">
                  {getInitial(cliente?.nome)}
                </span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">Bem-vindo(a)</h3>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {cliente?.nome || 'Nome do Usuário'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUAS DISPENSAS QUE TU CRIA AQUIIII ÓHHHHHH*/}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Suas Dispensas</h2>
          <div>
            <ClientModal usuarioID={id} />
          </div>
        </div>

        {dispensasCriadas.length > 0 ? renderDispensas(dispensasCriadas) : (
          <p className="text-slate-500 text-center">Você ainda não criou nenhuma dispensa.</p>
        )}
      </section>

      {/* DISPENSAS QUE TU PARTICIPA*/}
      <section className="container mx-auto px-6 py-4 md:py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dispensas que você participa</h2>
        {dispensasMembro.length > 0 ? renderDispensas(dispensasMembro) : (
          <p className="text-slate-500 text-center">Você ainda não participa de nenhuma outra dispensa.</p>
        )}
      </section>
    </main>
  );
}
