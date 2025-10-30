"use client"

import { Search, History, User, Calendar, TrendingUp, ArrowLeft, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import type { ClienteItf } from "@/app/utils/types/ClienteItf"
import type { DispensaItf } from "@/app/utils/types/DispensaItf"
import type { AlimentosItf } from "@/app/utils/types/AlimentosItf"

export default function RelatoriosPage() {
  const params = useParams()
  const router = useRouter()
  const dispensaId = params?.id
  const [dispensa, setDispensa] = useState<DispensaItf | null>(null)
  const [funcionario, setFuncionario] = useState<ClienteItf[]>([])
  const [alimentos, setAlimentos] = useState<AlimentosItf[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Temperature monitoring state
  const [temperature, setTemperature] = useState<number | null>(null)
  const [temperatureHistory, setTemperatureHistory] = useState<Array<{ time: string; temp: number }>>([])
  const [tempLoading, setTempLoading] = useState(true)

  useEffect(() => {
    if (!Cookies.get("token")) {
      router.replace("/")
      return
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

    async function buscaAlimentos() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/dispensa/${dispensaId}/alimentos`)
        const dados = await response.json()
        setAlimentos(dados)
      } catch (error) {
        console.error("Falha ao buscar alimentos:", error)
      }
    }

    async function buscaHistorico() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/relatorio/${dispensaId}`, {
          headers: {
            Authorization: "Bearer " + Cookies.get("token"),
          },
        })
        const dados = await response.json()
        setHistorico(dados)
      } catch (error) {
        console.error("Erro ao buscar histórico:", error)
      } finally {
        setLoading(false)
      }
    }

    if (dispensaId) {
      buscaDispensa()
      buscaAlimentos()
      buscaHistorico()
    }
  }, [dispensaId, router])

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const response = await fetch("https://api.thingspeak.com/channels/3129316/feeds.json?results=10")
        const data = await response.json()

        if (data.feeds && data.feeds.length > 0) {
          const latestFeed = data.feeds[data.feeds.length - 1]
          const tempValue = Number.parseFloat(latestFeed.field1)

          setTemperature(tempValue)

          const history = data.feeds
            .filter((feed: any) => feed.field1 !== null)
            .map((feed: any) => ({
              time: new Date(feed.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              temp: Number.parseFloat(feed.field1),
            }))

          setTemperatureHistory(history)
        }
      } catch (error) {
        console.error("Erro ao buscar temperatura:", error)
      } finally {
        setTempLoading(false)
      }
    }

    fetchTemperature()
    const interval = setInterval(fetchTemperature, 15000)
    return () => clearInterval(interval)
  }, [])

  const getTemperatureStatus = (temp: number | null) => {
    if (temp === null) return { color: "#90a1b9", status: "Aguardando dados...", bg: "#f1f5f9" }
    if (temp < 0) return { color: "#0ea5e9", status: "Muito Frio", bg: "#e0f2fe" }
    if (temp >= 0 && temp < 10) return { color: "#06b6d4", status: "Frio", bg: "#cffafe" }
    if (temp >= 10 && temp < 20) return { color: "#00c950", status: "Ideal", bg: "#dcfce7" }
    if (temp >= 20 && temp < 25) return { color: "#f59e0b", status: "Atenção", bg: "#fef3c7" }
    return { color: "#ef4444", status: "Crítico", bg: "#fee2e2" }
  }

  const tempStatus = getTemperatureStatus(temperature)

  const chartData = alimentos.slice(0, 4).map((alimento) => {
    const consumido = historico
      .filter((h) => h.alimento === alimento.nome)
      .reduce((sum, h) => sum + Number(h.quantidade || 0), 0)

    return {
      name: alimento.nome,
      consumo: consumido,
      disponivel: Number(alimento.peso),
    }
  })

  const historicoFiltrado = historico.filter(
    (item) =>
      item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alimento?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
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
        {/* Title and Controls */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/dispensa/${dispensaId}`}>
              <Button variant="outline" size="sm" className="border-[#e2e8f0] text-[#444444] bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-[#1d293d] text-2xl font-semibold mb-6">
            Relatórios e Histórico de Uso - {dispensa?.nome}
          </h1>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#90a1b9] w-4 h-4" />
              <Input
                placeholder="Buscar no histórico..."
                className="pl-10 bg-white border-[#e2e8f0] text-[#444444]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Employees */}
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

          {/* Chart */}
          <Card className="lg:col-span-2 bg-white border-[#e2e8f0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1d293d] text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00c950]" />
                Consumo por Item ({alimentos[0]?.unidadeTipo || "kg"})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#e2e8f0] text-[#444444] bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Últimos 7 dias
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: "#444444", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                      <YAxis tick={{ fill: "#444444", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="consumo" fill="#00c950" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="disponivel" fill="#f1f5f9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#90a1b9]">Nenhum dado disponível</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00c950] rounded"></div>
                  <span className="text-[#444444] text-sm">Consumido</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#f1f5f9] rounded"></div>
                  <span className="text-[#444444] text-sm">Disponível</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage History */}
        <Card className="bg-white border-[#e2e8f0] mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#1d293d] text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-[#432dd7]" />
              Histórico de Utilização
            </CardTitle>
            <Button className="bg-[#00c950] hover:bg-[#00a63e] text-white">Exportar Relatório</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c950]"></div>
              </div>
            ) : historicoFiltrado.length === 0 ? (
              <p className="text-center py-8 text-[#90a1b9]">
                {searchTerm ? "Nenhum registro encontrado." : "Nenhum histórico de uso disponível."}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="text-left py-3 text-[#62748e] text-sm font-medium">ID</th>
                        <th className="text-left py-3 text-[#62748e] text-sm font-medium">Usuário</th>
                        <th className="text-left py-3 text-[#62748e] text-sm font-medium">Item</th>
                        <th className="text-left py-3 text-[#62748e] text-sm font-medium">Quantidade</th>
                        <th className="text-left py-3 text-[#62748e] text-sm font-medium">Data</th>
                        <th className="text-left py-3 text-[#62748e] text-sm font-medium">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoFiltrado.map((record, index) => (
                        <tr key={index} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                          <td className="py-3 text-[#444444] text-sm">{record.id || index + 1}</td>
                          <td className="py-3 text-[#444444] text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-[#c6d2ff] text-[#432dd7] text-xs">
                                  {record.usuario
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase() || "??"}
                                </AvatarFallback>
                              </Avatar>
                              {record.usuario || "Desconhecido"}
                            </div>
                          </td>
                          <td className="py-3 text-[#444444] text-sm">{record.alimento}</td>
                          <td className="py-3 text-[#444444] text-sm font-medium">
                            {record.quantidade} {record.unidade}
                          </td>
                          <td className="py-3 text-[#444444] text-sm">
                            {new Date(record.data).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 text-[#444444] text-sm">
                            {new Date(record.data).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f1f5f9]">
                  <p className="text-[#90a1b9] text-sm">
                    Mostrando {historicoFiltrado.length} de {historico.length} registros
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Temperature Monitoring */}
        <Card className="bg-white border-[#e2e8f0]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#1d293d] text-lg flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-[#00c950]" />
              Monitoramento de Temperatura
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00c950] animate-pulse"></div>
              <span className="text-[#90a1b9] text-sm">Atualização em tempo real</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Temperature Display */}
              <div className="lg:col-span-1">
                <div className="rounded-lg p-6 text-center" style={{ backgroundColor: tempStatus.bg }}>
                  <p className="text-[#90a1b9] text-sm mb-2">Temperatura Atual</p>
                  {tempLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c950]"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-5xl font-bold" style={{ color: tempStatus.color }}>
                          {temperature !== null ? temperature.toFixed(1) : "--"}
                        </span>
                        <span className="text-2xl text-[#90a1b9]">°C</span>
                      </div>
                      <div
                        className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: tempStatus.color,
                          color: "white",
                        }}
                      >
                        {tempStatus.status}
                      </div>
                    </>
                  )}
                </div>

                {/* Temperature Guidelines */}
                <div className="mt-4 space-y-2">
                  <p className="text-[#444444] text-sm font-medium mb-3">Faixas de Temperatura:</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#0ea5e9]"></div>
                    <span className="text-[#444444] text-xs">{"< 0°C - Muito Frio"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#06b6d4]"></div>
                    <span className="text-[#444444] text-xs">0°C - 10°C - Frio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#00c950]"></div>
                    <span className="text-[#444444] text-xs">10°C - 20°C - Ideal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#f59e0b]"></div>
                    <span className="text-[#444444] text-xs">20°C - 25°C - Atenção</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#ef4444]"></div>
                    <span className="text-[#444444] text-xs">{"> 25°C - Crítico"}</span>
                  </div>
                </div>
              </div>

              {/* Temperature History Chart */}
              <div className="lg:col-span-2">
                <p className="text-[#444444] text-sm font-medium mb-4">Histórico de Temperatura (Últimas leituras)</p>
                <div className="h-[300px] w-full">
                  {tempLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c950]"></div>
                    </div>
                  ) : temperatureHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={temperatureHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="time"
                          tick={{ fill: "#444444", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          tick={{ fill: "#444444", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          domain={[0, 30]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperatura"]}
                        />
                        <Bar dataKey="temp" fill="#00c950" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-[#90a1b9] text-sm">Nenhum dado disponível</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 bg-[#f8fafc] rounded-lg">
                  <p className="text-[#444444] text-sm">
                    <strong>Nota:</strong> Os dados são atualizados automaticamente a cada 15 segundos via ThingSpeak
                    (Canal 3129316). A temperatura é lida do campo field1.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
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
            <div>
              <p className="text-[#90a1b9] text-sm mb-2">Desenvolvido por</p>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-[#e2e8f0] rounded-full"></div>
                <div className="w-8 h-8 bg-[#e2e8f0] rounded-full"></div>
                <div className="w-8 h-8 bg-[#e2e8f0] rounded-full"></div>
              </div>
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
