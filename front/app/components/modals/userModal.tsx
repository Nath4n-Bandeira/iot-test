'use client';

import { LucideUserPlus2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from './modal';
import { ClienteItf } from '@/app/utils/types/ClienteItf';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface UserModalProps {
  dispensaId: number;
  onUserAdded?: (user: ClienteItf) => void;
}

export default function UserModal({ dispensaId, onUserAdded }: UserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientes, setClientes] = useState<ClienteItf[]>([]);
  const [membros, setMembros] = useState<ClienteItf[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<ClienteItf[]>([]);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null); 

  const getInitial = (name: string | undefined): string => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  useEffect(() => {
    const carregarDados = async () => {
      if (!isOpen) return;

      try {
       
        const usuarioRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`, {
          headers: {
            Authorization: 'Bearer ' + (Cookies.get('token') || ''), // ou use context, se já tiver
          },
        });

        if (!usuarioRes.ok) throw new Error('Erro ao buscar usuário logado');

        const usuarioLogado = await usuarioRes.json();
        setUsuarioLogadoId(usuarioLogado.id);

        
        const [clientesRes, dispensaRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`),
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa/${dispensaId}`),
        ]);

        const todosClientes: ClienteItf[] = await clientesRes.json();
        const dadosDispensa = await dispensaRes.json();
        const membrosDaDispensa: ClienteItf[] = dadosDispensa?.membros || [];

        setClientes(todosClientes);
        setMembros(membrosDaDispensa);

        // 3. Filtrar clientes disponíveis
        const idsExcluidos = new Set([
          ...membrosDaDispensa.map(m => m.id),
          usuarioLogado.id,
        ]);

        const disponiveis = todosClientes.filter(c => !idsExcluidos.has(c.id));
        setClientesFiltrados(disponiveis);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        toast.error('Erro ao carregar usuários.');
      }
    };

    carregarDados();
  }, [isOpen, dispensaId]);

  const handleSelecionarUsuario = async (user: ClienteItf) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/dispensa/${dispensaId}/membro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (Cookies.get('token') || ''),
        },
        body: JSON.stringify({ usuarioID: user.id }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(`Erro ao adicionar usuário: ${error?.error || 'Erro desconhecido'}`);
        return;
      }

      const usuarioAdicionado = await res.json();
      if (onUserAdded) onUserAdded(usuarioAdicionado);

      toast.success(`Usuário "${user.nome}" adicionado à dispensa!`);
      setIsOpen(false);
    } catch (err) {
      console.error('Erro na requisição de membro:', err);
      toast.error('Erro de rede ao adicionar usuário.');
    }
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-[#2c2c2c] text-[#ffffff] rounded-md hover:bg-[#1e1e1e] font-medium flex justify-between"
        onClick={() => setIsOpen(true)}
      >
        Adicione um usuário
        <LucideUserPlus2 size={16} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <section className="container mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Selecionar Usuário</h2>
          </div>
<div className="flex flex-col gap-4">
  {clientesFiltrados.map((cliente) => (
    <button
      key={cliente.id}
      onClick={() => handleSelecionarUsuario(cliente)}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 flex items-center p-4 gap-4 text-left"
    >
      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-md shadow-green-500/30">
        <span className="text-2xl font-bold text-white select-none">
          {getInitial(cliente?.nome)}
        </span>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-900">
          {cliente?.nome || 'Nome do Usuário'}
        </h3>
        <p className="text-sm text-gray-500">ID: {cliente.id}</p>
      </div>
    </button>
  ))}
</div>
          )
        </section>
      </Modal>
    </>
  );
}
