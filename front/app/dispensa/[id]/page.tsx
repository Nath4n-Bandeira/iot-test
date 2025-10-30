"use client"
import { User, Search, Settings, BarChart3, History } from "lucide-react"
import ItemModal from "../../components/modals/addItemmodal"
import EditItemModal from "@/app/components/modals/editItemmodal"
import { useEffect, useState } from "react"
import type { AlimentosItf } from "../../utils/types/AlimentosItf"
import { useParams, useRouter } from "next/navigation"
import UserModal from "@/app/components/modals/userModal"
import type { DispensaItf } from "@/app/utils/types/DispensaItf"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ClienteItf } from "@/app/utils/types/ClienteItf"
import Cookies from "js-cookie"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function InstanciaPage() {
  const [alimentos, setPropostas] = useState<AlimentosItf[]>([])
  const [alimentoSelecionado, setAlimentoSelecionado] = useState<AlimentosItf | null>(null)
  const [dispensa, setDispensa] = useState<DispensaItf | null>(null)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [showGrafico, setShowGrafico] = useState(false)
  const [funcionario, setFuncionario] = useState<ClienteItf[]>([])
  const params = useParams()
  const dispensaId = params?.id
  const router = useRouter()
  const [logado, setLogado] = useState<boolean>(false)
  const [mostrarUso, setMostrarUso] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  async function buscarHistoricoUso() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/relatorio/${dispensaId}`, {
        headers: {
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      const dados = await response.json()
      setHistorico(dados)
      setMostrarUso(true)
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      alert("Erro ao buscar histórico de uso.")
    }
  }

  useEffect(() => {
    if (Cookies.get("token")) {
      setLogado(true)
    } else {
      router.replace("/")
    }
  }, [])

  useEffect(() => {
    async function buscaDados() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/dispensa/${dispensaId}/alimentos`)
        const dados = await response.json()
        setPropostas(dados)
      } catch (error) {
        console.error("Falha ao buscar alimentos:", error)
      }
    }

    async function buscaDispensa() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa/${dispensaId}`)
        const dados = await response.json()
        setDispensa(dados)
        setFuncionario(dados.membros || [])
      } catch (error) {
        console.error("Falha ao buscar dados da dispensa:", error)
      }
    }

    if (dispensaId) {
      buscaDados()
      buscaDispensa()
    }
  }, [dispensaId])

  function handleCloseDetails() {
    setAlimentoSelecionado(null)
  }

  async function handleDeleteItem(id: number) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/${id}`, {
        method: "DELETE",
      })
      setPropostas((prev) => prev.filter((item) => item.id !== id))
      handleCloseDetails()
    } catch (error) {
      console.error("Erro ao deletar alimento:", error)
    }
  }

  async function handleDeletePage(id: number) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token") || "",
        },
      })
      setDispensa(null)
      setShowConfigForm(false)
      router.push("/perfil")
    } catch (error) {
      console.error("Erro ao deletar dispensa:", error)
    }
  }

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28fd0", "#ffb6b9", "#c6e2ff"]

  const alimentosFiltrados = alimentos.filter((alimento) =>
    alimento.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/perfil" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00c950] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">f</span>
            </div>
            <span className="text-[#1d293d] font-semibold text-lg">foodflow</span>
          </Link>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#00c950]" />
            <span className="text-[#444444] text-sm">{funcionario[0]?.nome || "Usuário"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[#1d293d] text-2xl font-semibold mb-6">Controle da dispensa {dispensa?.nome}</h1>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#90a1b9] w-4 h-4" />
              <Input
                placeholder="Buscar item..."
                className="pl-10 bg-white border-[#e2e8f0] text-[#444444]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ItemModal dispensaId={Number(dispensaId)} />
            <Button
              variant="outline"
              className="border-[#e2e8f0] text-[#444444] bg-transparent"
              onClick={() => setShowConfigForm(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Config
            </Button>
            <Button className="bg-[#432dd7] hover:bg-[#314158] text-white" onClick={() => setShowGrafico(true)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Gráfico
            </Button>
            <Link href={`/relatorios/${dispensaId}`}>
              <Button className="bg-[#00c950] hover:bg-[#00a63e] text-white">
                <History className="w-4 h-4 mr-2" />
                Histórico de Uso
              </Button>
            </Link>
            <UserModal
              dispensaId={Number(dispensaId)}
              onUserAdded={(user) => {
                setFuncionario((prev) => {
                  if (prev.some((f) => f.id === user.id)) return prev
                  return [...prev, user]
                })
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Employees Card */}
          <Card className="bg-white border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="text-[#1d293d] text-lg">Funcionários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {funcionario.length > 0 ? (
                funcionario.map((employee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#c6d2ff] text-[#432dd7] text-xs">
                        {employee.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[#444444] text-sm">{employee.nome}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#90a1b9] text-center py-4">Nenhum funcionário cadastrado.</p>
              )}
            </CardContent>
          </Card>

          {/* Stock Card */}
          <Card className="lg:col-span-2 bg-white border-[#e2e8f0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1d293d] text-lg">Seu estoque</CardTitle>
              <Button
                className="bg-[#00c950] hover:bg-[#00a63e] text-white"
                onClick={() => setMostrarUso((prev) => !prev)}
              >
                {mostrarUso ? "Fechar uso de alimentos" : "Registrar uso de alimentos"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0]">
                      <th className="text-left py-3 text-[#62748e] text-sm font-medium">ID</th>
                      <th className="text-left py-3 text-[#62748e] text-sm font-medium">Nome</th>
                      <th className="text-right py-3 text-[#62748e] text-sm font-medium">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alimentosFiltrados.length > 0 ? (
                      alimentosFiltrados.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer"
                          onClick={() => setAlimentoSelecionado(item)}
                        >
                          <td className="py-3 text-[#444444] text-sm">{item.id}</td>
                          <td className="py-3 text-[#444444] text-sm">{item.nome}</td>
                          <td className="py-3 text-right text-[#444444] text-sm font-medium">
                            {item.unidadeTipo} {item.peso}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-[#90a1b9]">
                          {searchTerm ? "Nenhum item encontrado." : "Nenhum item no estoque."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {mostrarUso && (
          <Card className="bg-white border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="text-[#1d293d] text-lg">Registrar uso de alimentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)

                  const entradas = alimentos
                    .map((alimento) => {
                      const valor = formData.get(`alimento-${alimento.id}`)
                      const numero = Number(valor)
                      return valor && !isNaN(numero) && numero > 0 ? { id: alimento.id, quantidade: numero } : null
                    })
                    .filter(Boolean)

                  if (entradas.length === 0) return alert("Nenhuma quantidade válida informada.")

                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/relatorio`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + Cookies.get("token"),
                      },
                      body: JSON.stringify({
                        alimentos: entradas,
                        dispensaId: Number(dispensaId),
                      }),
                    })

                    if (response.ok) {
                      alert("Uso registrado com sucesso.")
                      location.reload()
                    } else {
                      const erro = await response.json()
                      console.error(erro)
                      alert("Erro ao registrar uso: " + (erro?.error || "Erro desconhecido"))
                    }
                  } catch (error) {
                    console.error(error)
                    alert("Erro inesperado.")
                  }
                }}
              >
                {alimentos.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-[#444444] text-sm font-medium">{item.nome}</div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        name={`alimento-${item.id}`}
                        placeholder={`em ${item.unidadeTipo.toLowerCase()}`}
                        className="bg-[#f8fafc] border-[#e2e8f0] text-[#444444]"
                      />
                    </div>
                    <div className="text-[#90a1b9] text-sm w-32 text-right">Disponível: {item.peso}</div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button type="submit" className="bg-[#00c950] hover:bg-[#00a63e] text-white">
                    Enviar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {alimentoSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#e2e8f0]">
              <button
                onClick={handleCloseDetails}
                className="float-right font-bold text-[#90a1b9] hover:text-[#1d293d]"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-[#1d293d] mb-4">{alimentoSelecionado.nome}</h2>
              <p className="mb-2 text-[#444444]">
                <strong>ID:</strong> {alimentoSelecionado.id}
              </p>
              <p className="mb-2 text-[#444444]">
                <strong>Peso:</strong> {alimentoSelecionado.peso} {alimentoSelecionado.unidadeTipo}
              </p>
              <p className="mb-2 text-[#444444]">
                <strong>Tipo de Unidade:</strong> {alimentoSelecionado.unidadeTipo}
              </p>
              {alimentoSelecionado.perecivel && (
                <p className="mb-4 text-[#444444]">
                  <strong>Perecível:</strong> {alimentoSelecionado.perecivel}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <EditItemModal id={Number(alimentoSelecionado?.id)} dispensaId={Number(dispensaId)} />
                <button
                  onClick={() => {
                    if (alimentoSelecionado) handleDeleteItem(alimentoSelecionado.id)
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfigForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl border border-[#e2e8f0]">
              <button
                onClick={() => setShowConfigForm(false)}
                className="float-right font-bold text-[#90a1b9] hover:text-[#1d293d]"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-[#1d293d] mb-4">Configurações da Dispensa</h2>

              {dispensa ? (
                <p className="text-[#444444] mb-4">
                  <strong>Nome:</strong> {dispensa.nome}
                </p>
              ) : (
                <p className="text-[#90a1b9] mb-4">Carregando nome da dispensa...</p>
              )}

              <button
                onClick={() => {
                  if (dispensaId) handleDeletePage(Number(dispensaId))
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
              >
                Deletar Dispensa
              </button>
            </div>
          </div>
        )}

        {showGrafico && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-lg w-full shadow-xl border border-[#e2e8f0]">
              <button
                onClick={() => setShowGrafico(false)}
                className="float-right font-bold text-[#90a1b9] hover:text-[#1d293d]"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-[#1d293d] mb-4">Distribuição do Estoque</h2>

              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={alimentos.map((item) => ({ name: item.nome, value: Number(item.peso) }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {alimentos.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-[#e2e8f0] px-6 py-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#00c950] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="text-[#1d293d] font-semibold">foodflow</span>
              </div>
              <p className="text-[#90a1b9] text-sm">Sua plataforma de gestão de dispensas.</p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-[#e2e8f0]">
            <p className="text-[#90a1b9] text-xs">© 2025 foodflow. Projeto integrador</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
