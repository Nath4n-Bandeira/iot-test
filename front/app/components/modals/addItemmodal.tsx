'use client'

import { useEffect, useState } from 'react';
import Modal from './modal';
import { useForm } from "react-hook-form";
import { AlimentosItf } from '@/app/utils/types/AlimentosItf';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type inputs = {
  nome: string;
  peso: number;
  perecivel: string;
  unidadeTipo: string;
};

type userPayload = {
  clienteLogadoId: string;
  clienteLogadoNome: string;
};

export default function ItemModal({ dispensaId }: { dispensaId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit } = useForm<AlimentosItf>();
  const [user, setUser] = useState<userPayload | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<userPayload>(token);
      setUser(decoded);
      console.log("Usuário logado:", decoded);
    } catch (error) {
      alert("Token inválido. Faça login novamente.");
      console.error("Erro ao decodificar o token:", error);
    }
  }, []);

  const router = useRouter();

  async function tryinput(data: inputs) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/alimentos/dispensa/${dispensaId}/alimentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token") || ""
        },
        body: JSON.stringify({
          nome: data.nome,
          peso: Number(data.peso),
          perecivel: data.perecivel,
          unidadeTipo: data.unidadeTipo,
          dispensaId: dispensaId,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("Erro ao enviar:", errorData);
          toast.error(errorData?.erro || "Erro ao enviar o item.");
        } else {
          const errorText = await response.text();
          console.error("Erro ao enviar (texto):", errorText);
          toast.error("Erro inesperado ao enviar.");
        }
        return;
      }

      console.log("Item enviado com sucesso!");
      setIsOpen(false);
      toast.success("Item enviado com sucesso!");
      router.refresh(); // melhor que window.reload
    } catch (error) {
      console.error("Erro de rede ou outra falha:", error);
      toast.error("Erro de rede ao tentar enviar.");
    }
  }

  return (
    <>
      <button
        className="px-4 py-2 bg-[#2c2c2c] text-[#ffffff] rounded-md hover:bg-[#1e1e1e] font-medium"
        onClick={() => setIsOpen(true)}
      >
        Adicione um item
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleSubmit(tryinput)}>
          <label className="block text-sm font-medium text-gray-700">Nome do alimento</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" type="text" required {...register("nome")} />

          <label className="block text-sm font-medium text-gray-700 mt-4">Qtd\Kg</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" type="number" required {...register("peso", { valueAsNumber: true })} />

          <div className="mb-3">
            <label htmlFor="unidadeTipo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-700">TipoUni</label>
            <select id="unidadeTipo" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required {...register("unidadeTipo")}>
              <option value="KG">KG</option>
              <option value="PCT">PCT</option>
              <option value="REDE">REDE</option>
              <option value="DUZIA">DUZIA</option>
              <option value="LT">LT</option>
              <option value="Unid">Unid</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="perecivel" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-700">Perecível</label>
            <select id="perecivel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required {...register("perecivel")}>
              <option value="NÃO">NÃO</option>
              <option value="SIM">SIM</option>
            </select>
          </div>

          <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Enviar item
          </button>
        </form>
      </Modal>
    </>
  );
}
